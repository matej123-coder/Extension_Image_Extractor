import { useState } from "react";
import { loadPdf } from "./pdf/loadPdf";
import extractImage from "./pdf/extractImage";
import { type Images } from "./types/types";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
function App() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [images, setImages] = useState<Images[]>([]);
    const [pdf,setPdf] = useState<PDFDocumentProxy | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = event.target.files?.[0] || null;
        if (!selectedFile) {
            return;
        }
        if (selectedFile.type !== "application/pdf") {

            alert("Please upload a valid PDF.");
            return;
        }

        setFile(selectedFile);
        setLoading(true);

        try {
            const pdf = await loadPdf(selectedFile);
            console.log("Loaded PDF:", pdf);
            setPdf(pdf);
            


        } catch (error) {
            console.error("Failed to load PDF:", error);
        } finally {
            setLoading(false);
        }
    }
    async function handleExtractionImages() {
        if(!pdf){
            alert("Please select a PDF first.");
            return;
        }
        setLoadingPdf(true)

        try {
            const extractedImages = await extractImage(pdf);
            
            setImages(extractedImages)
        } catch (error) {
             console.error("Failed to extract images:", error);
        }
        finally{
            setLoading(true);
        }
    }
    return (
        <>
            <div className="pdf-container">
                <h1>PDF Image Extractor</h1>
                <h2>Save every photo and graphic embedded in a PDF as a separate image file and download all pictures at once as a ZIP archive for further processing</h2>
                <div className="input-field">
                    <label htmlFor="pdf-upload" className="file-upload">
                        <span className="file-upload-icon">↑</span>
                        <span className="file-upload-title">Choose a PDF</span>
                        <span className="file-upload-text">or drag and drop your file here</span>

                        <input
                            id="pdf-upload"
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
                <div className="extract-btn">
                    <button onClick={handleExtractionImages}> Extract Images</button>
                </div>
                <div className="image-section">
                    <div className="header">
                        <h1>All Images</h1>
                        <div className="download-btn-all">
                            <button><svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
                                    <path d="M17 17H17.01M17.4 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H6.6M12 15V4M12 15L9 12M12 15L15 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg> Download All Images</button>
                        </div>
                    </div>

                    <div className="image-container">
                        { images.map((image)=>(
                             <div className="image-element">
                            <div className="image-object">
                                <img src={image.imageUrl} alt="Hello" />
                            </div>
                            <div className="info-box">
                                <ul className="info-list">
                                    <li>Width : {image.width}</li>
                                    <li>Height : {image.height}</li>
                                    <li>Type : {image.imageType}</li>
                                    <li>Page Number : {image.pageNumber}</li>
                                </ul>
                            </div>
                            <div className="download-btn">
                                <button> <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
                                    <path d="M17 17H17.01M17.4 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H6.6M12 15V4M12 15L9 12M12 15L15 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg> Download Button</button>
                            </div>
                        </div>
                        ))}
                       
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;
