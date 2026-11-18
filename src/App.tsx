import { useEffect, useRef, useState } from "react";
import { loadPdf, loadPdfFromUrl } from "./pdf/loadPdf";
import extractImage from "./pdf/extractImage";
import {
    type CheckBoxOptions,
    type ImageFormat,
    type ImageRect,
    type Images,
    type PdfError,
} from "./types/types";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import JSZip from "jszip";
import convertImageForDownload from "./pdf/convertImageForDownload";
import PagePreview from "./component/PagePreview";
import getPdfErrorMessage from "./error-hanlding/error";
import generatePdfThumbnail from "./pdf/generateThumbnail";
import { getImages, saveImages } from "./db/imagesDB";
import { retrievePDFInfo, savePDFInfo } from "./db/pdfDB";
import FileUploader from "./component/FileUploader";
import CurrentTab from "./component/CurrentTab";
import PdfUrl from "./component/PdfUrl";
import ExtractionResult from "./component/ExtractionResult";

const ALLOWED_FORMATS: ImageFormat[] = ["png", "jpeg", "webp"];
function App() {

    const [checkBoxValue, setCheckBoxValue] = useState<CheckBoxOptions>('currentTab');
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [images, setImages] = useState<Images[]>([]);
    const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [selectedImages, setSelectedImages] = useState<Images[]>([]);
    const [loadingDownload, setLoadingDownload] = useState(false);
    const positionRef = useRef(new Map<string, ImageRect | null>());
    const [finishProcessing, setFinishProcessing] = useState<boolean>(false);
    const [pdfError, setPdfError] = useState<PdfError | null>(null);
    const [pdfThumbnail, setPdfThumbnail] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState<number | null>(null);

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const url = tabs[0]?.url;
            if (url && url.toLowerCase().includes(".pdf")) {
                setPdfUrl(url);
            }
        });
    }, []);
    useEffect(() => {
        async function retrieveInfoFromDB() {
            try {
                const storedImages = await getImages();
                const pdfInfo = await retrievePDFInfo();
                if (pdfInfo) {
                    setPdfThumbnail(pdfInfo.thumbnail);
                    setFileName(pdfInfo.pdfFileName);
                    setPdf(pdfInfo.pdf);
                }
                if (storedImages && storedImages.length > 0) {
                    setImages(storedImages);

                    console.log("Retrieved images from IndexedDB:", storedImages);
                }
            }
            catch (error) {
                console.error("Couldn't retrieve images from IndexedDB:", error);
            }
        }
        retrieveInfoFromDB();

    }, []);
    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (pdfUrl) {
            setPdfError({
                title: "PDF Already Loaded",
                message: "You cannot upload a PDF while being on an active tab with PDF URL.",
            });
            event.target.value = "";
            return;
        }
        const selectedFile = event.target.files?.[0] || null;

        if (!selectedFile) {
            return;
        }

        if (selectedFile.type !== "application/pdf") {
            setPdfError({
                title: "Invalid File Type",
                message: "Please select a valid PDF file.",
            });
            return;
        }
        setFileName(selectedFile.name ?? null);
        try {
            const pdf = await loadPdf(selectedFile);
            const thumbnail = await generatePdfThumbnail(pdf);
            setTotalPages(pdf.numPages)
            setPdf(pdf);
            setPdfThumbnail(thumbnail);
        } catch (error) {
            console.error("Failed to load PDF:", error);
            setPdfError(getPdfErrorMessage(error));
        }
    }
    async function handleBackToExtraction(){
         await saveImages([]);
        await savePDFInfo(null, null);

        setImages([]);
        setSelectedImages([]);
        setPdf(null);
        setPdfThumbnail(null);
        setFileName(null);
        setPreviewIndex(null);
        setFinishProcessing(false);
        setPdfError(null);
    }
    async function handleExtractionImages() {
        setFinishProcessing(false);
        setLoadingPdf(true);
        try {
            let currentPdf = pdf;
            let fileInfoName = fileName;
            if (pdfUrl) {
                try {
                    const pdfFromUrl = await loadPdfFromUrl(pdfUrl);
                    currentPdf = pdfFromUrl;
                    setPdf(pdfFromUrl);
                    setTotalPages(pdfFromUrl.numPages)
                    const thumbnail = await generatePdfThumbnail(currentPdf);
                    setPdfThumbnail(thumbnail);
                    const pdfName = pdfUrl.split("/").at(pdfUrl.split("/").length - 1) ?? "document.pdf";
                    const clearPDFName = decodeURIComponent(pdfName);
                    fileInfoName = clearPDFName;
                    setFileName(clearPDFName);
                } catch (error) {
                    console.error("Failed to load PDF from URL:", error);
                    setPdfError(getPdfErrorMessage(error));
                    return;
                }
            }

            if (!currentPdf) {
                setPdfError({
                    title: "No PDF Selected",
                    message:
                        "Please select a PDF file or open a PDF URL in your browser first.",
                });
                return;
            }

            const extractedImages = await extractImage(currentPdf);
            setImages(extractedImages);
            await saveImages(extractedImages);
            await savePDFInfo(currentPdf, fileInfoName);

        } catch (error) {
            console.error("Failed to extract images", error);
            setPdfError({
                title: "Image Extraction Failed",
                message:
                    "We encountered a problem while extracting images from this PDF. Please try again.",
            });
        } finally {
            setLoadingPdf(false);
            setFinishProcessing(true);
        }
    }

    async function handleDownloadAllImages() {
        if (images.length === 0) {
            setPdfError({
                title: "No images",
                message: "There are no images to download.",
            });
            return;
        }

        setLoadingDownload(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const zip = new JSZip();

            await Promise.all(
                images.map(async (image, index) => {
                    if (image.imageType === "png") {
                        zip.file(`image_${index + 1}.png`, image.image);
                        return {
                            name: `image_${index + 1}.png`,
                            blob: image.image,
                        };
                    }
                    const convertedBlob = await convertImageForDownload(
                        image.image,
                        `image_${index + 1}`,
                        image.imageType,
                    );
                    if (!convertedBlob) {
                        alert("Failed to convert this image!");
                        return;
                    }
                    zip.file(`image_${index + 1}.${image.imageType}`, convertedBlob);
                    return {
                        name: `image_${index + 1}.${image.imageType}`,
                        blob: convertedBlob,
                    };
                }),
            );

            const zipBlob = await zip.generateAsync({ type: "blob" });

            const url = URL.createObjectURL(zipBlob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "images.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download images: ", error);
            setPdfError({
                title: "Couldn't download images",
                message: "Something went wrong couldn't download the images",
            });
        } finally {
            setLoadingDownload(false);
        }
    }

    async function handleDownloadImage(index: number) {
        const image = images[index];
        let blob: Blob | null = image.image;

        if (image.imageType !== "png") {
            const convertedBlob = await convertImageForDownload(
                image.image,
                `image_${index + 1}`,
                image.imageType,
            );
            if (!convertedBlob) {
                alert("Failed to convert this image!");
                return;
            }

            blob = convertedBlob;
        }

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `image_${index + 1}.${image.imageType}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    function handleFormatValue(
        event: React.ChangeEvent<HTMLSelectElement>,
        index: number,
    ) {
        const selectedFormat = event.target.value as ImageFormat;

        const finalFormat = ALLOWED_FORMATS.includes(selectedFormat)
            ? selectedFormat
            : "png";

        setImages((prevImages) =>
            prevImages.map((img, i) => {
                if (i === index) {
                    return { ...img, imageType: finalFormat };
                }
                return img;
            }),
        );
        setSelectedImages((prevImages) =>
            prevImages.map((img, i) => {
                if (i === index) {
                    return { ...img, imageType: finalFormat };
                }
                return img;
            }),
        );
    }
    async function handleDownloadSelectedImages() {
        if (selectedImages.length === 0) {
            setPdfError({
                title: "No images",
                message: "There are no selected images to download",
            });
            return;
        }

        setLoadingDownload(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const zip = new JSZip();

            await Promise.all(
                selectedImages.map(async (image, index) => {
                    if (image.imageType === "png") {
                        zip.file(`image_${index + 1}.png`, image.image);
                        return {
                            name: `image_${index + 1}.png`,
                            blob: image.image,
                        };
                    }
                    const convertedBlob = await convertImageForDownload(
                        image.image,
                        `image_${index + 1}`,
                        image.imageType,
                    );
                    if (!convertedBlob) {
                        alert("Failed to convert this image!");
                        return;
                    }
                    zip.file(`image_${index + 1}.${image.imageType}`, convertedBlob);
                    return {
                        name: `image_${index + 1}.${image.imageType}`,
                        blob: convertedBlob,
                    };
                }),
            );

            const zipBlob = await zip.generateAsync({ type: "blob" });

            const url = URL.createObjectURL(zipBlob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "images.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download images: ", error);
            setPdfError(getPdfErrorMessage(error));
        } finally {
            setLoadingDownload(false);
        }
    }
    return (
        <>
            <div className="pdf-container">
                {loadingPdf && (
                    <div id="loaderSpinner" className="">
                        <div className="loading-spinner"></div>
                        <div className="loading-text">Extracting Images...</div>
                    </div>
                )}
                {loadingDownload && (
                    <div id="loaderSpinner" className="">
                        <div className="loading-spinner"></div>
                        <div className="loading-text">Downloading Images...</div>
                    </div>
                )}
                {pdfError ? (
                    <div className="pdf-error">
                        <div className="pdf-error-icon">!</div>

                        <div className="pdf-error-content">
                            <h3>{pdfError.title}</h3>
                            <p>{pdfError.message}</p>

                            <button
                                className="pdf-error-dismiss"
                                onClick={() => { setPdfError(null); setFinishProcessing(false); }}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                ) : finishProcessing && images.length === 0 && !pdfError ? (
                    <div className="pdf-error pdf-warning">
                        <div className="pdf-error-icon pdf-warning-icon">!</div>

                        <div className="pdf-error-content pdf-warning-content">
                            <h3>There are no images</h3>
                            <p>Unfortunately there are no images in this pdf </p>

                            <button
                                className="pdf-error-dismiss pdf-warning-dismiss"
                                onClick={() => setFinishProcessing(false)}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                ) : null}


                {images.length > 0 ? (
                    <ExtractionResult totalPages={totalPages} handleDownloadAllImages={handleDownloadAllImages} selectedImages={selectedImages} setPreviewIndex={setPreviewIndex} setSelectedImages={setSelectedImages} handleDownloadImage={handleDownloadImage} handleFormatValue={handleFormatValue} handleDownloadSelectedImages={handleDownloadSelectedImages} images={images} fileName={fileName} handleBackToExtraction={handleBackToExtraction}  />
                ) : (
                    <>
                        <div className="logo">
                            <div className="heading">
                                <h1 className="project-name">ImageKO </h1>
                                <h4 className="project-purpose">PDF Image Extractor</h4>
                            </div>
                            <img src="/images/logo.png" alt="Logo" />
                        </div>

                        <h2>
                            Extract images from any PDF document. Preview, select, and download individual images or export them all together in a ZIP archive.
                        </h2>
                        <div className="radio-input-container">
                            <div className="radio-button-field">
                                <input type="radio" id="currentTab" name="file" value="currentTab" checked={checkBoxValue === 'currentTab'} onChange={() => setCheckBoxValue('currentTab')} />
                                <label htmlFor="currentTab">Current Tab</label>
                            </div>
                            <div className="radio-button-field">
                                <input type="radio" id="uploadFile" name="file" value="uploadFile" checked={checkBoxValue === 'fileUpload'} onChange={() => setCheckBoxValue('fileUpload')} />
                                <label htmlFor="uploadFile">Upload File</label>
                            </div>
                            <div className="radio-button-field">
                                <input type="radio" id="pdfUrl" name="file" value="pdfUrl" checked={checkBoxValue === 'pdfUrl'} onChange={() => setCheckBoxValue('pdfUrl')} />
                                <label htmlFor="pdfUrl">PDF URL</label>
                            </div>
                        </div>
                        {checkBoxValue === "currentTab" && (
                            <CurrentTab fileName={fileName} pdfUrl={pdfUrl} />
                        )}
                        {checkBoxValue === "fileUpload" && (
                            <FileUploader fileName={fileName} pdf={pdf} pdfThumbnail={pdfThumbnail} handleFileChange={handleFileChange} />
                        )}
                        {checkBoxValue === "pdfUrl" && (
                            <PdfUrl setPdfUrl={setPdfUrl} />
                        )}
                        <div className="extract-btn">
                            <button onClick={handleExtractionImages} disabled={!pdf && !pdfUrl}>
                                {" "}
                                Extract Images
                            </button>
                        </div>
                    </>
                )}
            </div>
            {pdf && previewIndex !== null && (
                <PagePreview
                    pdf={pdf}
                    images={images}
                    selectedIndex={previewIndex}
                    onClose={() => setPreviewIndex(null)}
                    positionRef={positionRef}
                />
            )}
        </>
    );
}

export default App;
