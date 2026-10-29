import { useEffect, useRef, useState } from "react";
import { loadPdf, loadPdfFromUrl } from "./pdf/loadPdf";
import extractImage from "./pdf/extractImage";
import { type ImageFormat, type ImageRect, type Images } from "./types/types";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import JSZip from "jszip";
import convertImageForDownload from "./pdf/convertImageForDownload";
import PagePreview from "./component/PagePreview";


const ALLOWED_FORMATS: ImageFormat[] = ["png", "jpeg", "webp"];
function App() {
    //   const [loading, setLoading] = useState<boolean>(false);
    const [loadFromUrl, setLoadFromUrl] = useState<boolean>(false)
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [images, setImages] = useState<Images[]>([]);
    const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [selectedImages, setSelectedImages] = useState<Images[]>([]);
    const [loadingDownload, setLoadingDownload] = useState(false);
    const positionRef = useRef(new Map<string, ImageRect | null>());

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true },
            (tabs) => {
                const url = tabs[0]?.url;
                if (url && url.toLowerCase().includes(".pdf") && url.startsWith("http")) { setPdfUrl(url); }

            });
    }, [])


    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = event.target.files?.[0] || null;
        if (!selectedFile) {
            return;
        }
        
        if (selectedFile.type !== "application/pdf") {
            alert("Please upload a valid PDF.");
            return;
        }

        try {
            const pdf = await loadPdf(selectedFile);
            console.log("Loaded PDF:", pdf);
            setPdf(pdf);
        } catch (error) {
            console.error("Failed to load PDF:", error);
        }
    }

    async function handleExtractionImages() {
        let currentPdf = pdf;
        if(pdfUrl){
            const pdfFromUrl = await loadPdfFromUrl(pdfUrl);
            if(!pdfFromUrl){
                return;
            }
            currentPdf = pdfFromUrl;
            setPdf(pdfFromUrl);
            setLoadFromUrl(true);
        }
        
        if (!currentPdf) {
            alert("Please select a PDF first.");
            return;
        }
        setLoadingPdf(true);

        try {
            
            const extractedImages = await extractImage(currentPdf);
            console.log("This are my extracted images:", extractedImages);
            setImages(extractedImages);
        } catch (error) {
            console.error("Failed to extract images:", error);
        } finally {
            setLoadingPdf(false);
        }
    }

    async function handleDownloadAllImages() {

        if (images.length === 0) {
            alert("No images to download.");
            return;
        }

        setLoadingDownload(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const zip = new JSZip();

            await Promise.all(images.map(async (image, index) => {
                if (image.imageType === "png") {
                    zip.file(`image_${index + 1}.png`, image.image)
                    return {
                        name: `image_${index + 1}.png`,
                        blob: image.image
                    }
                }
                const convertedBlob = await convertImageForDownload(image.image,
                    `image_${index + 1}`,
                    image.imageType,
                )
                if (!convertedBlob) {
                    alert("Failed to convert this image!");
                    return;
                }
                zip.file(`image_${index + 1}.${image.imageType}`, convertedBlob)
                return {
                    name: `image_${index + 1}.${image.imageType}`,
                    blob: convertedBlob,
                }

            }))


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
        } finally {
            setLoadingDownload(false)
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
            }
            )
        )
    }
    async function handleDownloadSelectedImages() {
        if (selectedImages.length === 0) {
            alert("No images to download.");
            return;
        }

        setLoadingDownload(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const zip = new JSZip();

            await Promise.all(selectedImages.map(async (image, index) => {
                if (image.imageType === "png") {
                    zip.file(`image_${index + 1}.png`, image.image)
                    return {
                        name: `image_${index + 1}.png`,
                        blob: image.image
                    }
                }
                const convertedBlob = await convertImageForDownload(image.image,
                    `image_${index + 1}`,
                    image.imageType,
                )
                if (!convertedBlob) {
                    alert("Failed to convert this image!");
                    return;
                }
                zip.file(`image_${index + 1}.${image.imageType}`, convertedBlob)
                return {
                    name: `image_${index + 1}.${image.imageType}`,
                    blob: convertedBlob,
                }

            }))


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
        } finally {
            setLoadingDownload(false)
        }
    }
    return (
        <>
            <div className="pdf-container">
                {loadingPdf && (
                    <div id="loaderSpinner" className="">
                        <div className="loading-spinner"></div>
                        <div className="loading-text">Loading PDF...</div>
                    </div>
                )}
                {loadingDownload && (
                    <div id="loaderSpinner" className="">
                        <div className="loading-spinner"></div>
                        <div className="loading-text">Downloading Images...</div>
                    </div>
                )}
                <h1>PDF Image Extractor</h1>
                <h2>
                    Save every photo and graphic embedded in a PDF as a separate image
                    file and download all pictures at once as a ZIP archive for further
                    processing
                </h2>
                <div className="input-field">
                    <label htmlFor="pdf-upload" className="file-upload">
                        <span className="file-upload-icon">↑</span>
                        <span className="file-upload-title">Choose a PDF</span>
                        <span className="file-upload-text">
                            or drag and drop your file here
                        </span>

                        <input
                            id="pdf-upload"
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
                <div className="extract-btn">
                    <button onClick={handleExtractionImages} disabled={(!pdf && !pdfUrl) || images.length !== 0}> Extract Images</button>
                </div>
                {images.length > 0 && (
                    <div className="image-section">
                        <div className="header">
                            <h1>All Images</h1>
                            <div className="download-btn-all">
                                <button onClick={handleDownloadSelectedImages} className="download-btn selected-images" disabled={selectedImages.length === 0}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="800px"
                                        height="800px"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M17 17H17.01M17.4 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H6.6M12 15V4M12 15L9 12M12 15L15 12"
                                            stroke="white"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                    </svg>{" "}
                                    Download Selected
                                </button>
                                <button onClick={handleDownloadAllImages} className="download-btn">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="800px"
                                        height="800px"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M17 17H17.01M17.4 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H6.6M12 15V4M12 15L9 12M12 15L15 12"
                                            stroke="white"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                    </svg>{" "}
                                    Download All
                                </button>
                            </div>
                        </div>


                        <div className="image-table-container">
                            <table className="image-table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Index</th>
                                        <th>Preview</th>
                                        <th>Width</th>
                                        <th>Height</th>
                                        <th>Type</th>
                                        <th>Page Number</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {images.map((image, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input type="checkbox" className="select-checkbox" onChange={(event) => {
                                                    const { checked } = event.target;

                                                    setSelectedImages((prev) =>
                                                        checked
                                                            ? [...prev, image]
                                                            : prev.filter((selectImage) =>
                                                                selectImage.pageNumber !== image.pageNumber ||
                                                                selectImage.paintIndex !== image.paintIndex
                                                            )
                                                    )

                                                }} />
                                            </td>
                                            <td>{index + 1}</td>
                                            <td className="image-preview-cell">
                                                <img src={image.imageUrl} alt={`Extracted image ${index + 1}`} />
                                            </td>

                                            <td>{image.width}px</td>
                                            <td>{image.height}px</td>
                                            <td>{image.imageType.toUpperCase()}</td>
                                            <td>{image.pageNumber}</td>

                                            <td>
                                                <div className="image-actions">
                                                    <button
                                                        className="preview-btn"
                                                        onClick={() => {
                                                            setPreviewIndex(index)
                                                        }}
                                                    >
                                                        Preview
                                                    </button>

                                                    <div className="download-actions">
                                                        <select
                                                            name="selectFormat"
                                                            id="selectFormat"
                                                            aria-label={`Output format for image ${index + 1}`}
                                                            value={image.imageType.toLowerCase()}
                                                            onChange={(event) =>
                                                                handleFormatValue(event, index)
                                                            }
                                                        >
                                                            <option value="png">PNG</option>
                                                            <option value="jpeg">JPEG</option>
                                                            <option value="webp">WEBP</option>
                                                        </select>

                                                        <button
                                                            className="download-btn"
                                                            onClick={() => handleDownloadImage(index)}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="800px"
                                                                height="800px"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                            >
                                                                <path
                                                                    d="M17 17H17.01M17.4 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H6.6M12 15V4M12 15L9 12M12 15L15 12"
                                                                    stroke="white"
                                                                    stroke-width="2"
                                                                    stroke-linecap="round"
                                                                    stroke-linejoin="round"
                                                                />
                                                            </svg>


                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>


                    </div>
                )}
            </div>
            {!loadFromUrl && pdf && previewIndex !== null && (
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
