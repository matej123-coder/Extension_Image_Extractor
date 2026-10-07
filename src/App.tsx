import { useState } from "react";
import { loadPdf } from "./pdf/loadPdf";
import extractImage from "./pdf/extractImage";
import { type ImageFormat, type Images } from "./types/types";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import JSZip from "jszip";
import convertImageForDownload from "./pdf/convertImageForDownload";

const ALLOWED_FORMATS : ImageFormat[] = ['png', 'jpeg', 'webp'];
function App() {
//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);

  const [images, setImages] = useState<Images[]>([]);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
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
    
    try {
      const pdf = await loadPdf(selectedFile);
      console.log("Loaded PDF:", pdf);
      setPdf(pdf);
    } catch (error) {
      console.error("Failed to load PDF:", error);
    }
  }

  async function handleExtractionImages() {
    if (!pdf) {
      alert("Please select a PDF first.");
      return;
    }
    setLoadingPdf(true);

    try {
      const extractedImages = await extractImage(pdf);
     console.log("This are my extracted images:",extractedImages)
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
    const zip = new JSZip();

    images.forEach((image, index) => {
      zip.file(`image_${index + 1}.${image.imageType}`, image.image);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });

    const url = URL.createObjectURL(zipBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "images.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
 async function handleDownloadImage(index:number){

    const image = images[index];
    let blob : Blob | null = image.image;
    let extension = image.imageType;

    if(image.imageType !== "png"){
        const convertedBlob = await convertImageForDownload(
      image.image,
      `image_${index + 1}`,
      image.imageType
    );
         if (!convertedBlob) {
         alert("Failed to convert this image!")
        }
      
        blob = convertedBlob;

    }
    if(!blob){
         alert("Failed to convert this image!")
    }
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a")
    link.href = image.imageUrl;
    link.download = `image_${index+1}.${image.imageType}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link);

  }
  function handleFormatValue( event: React.ChangeEvent<HTMLSelectElement>, index:number){
        const selectedFormat = event.target.value as ImageFormat;
        
        const finalFormat = ALLOWED_FORMATS.includes(selectedFormat) ? selectedFormat : "png"

        setImages((prevImages)=> prevImages.map((img,i)=>{
            if(i === index){
                return {... img, imageType:finalFormat}
            }
            return img
        }))
        
  }
  return (
    <>
      <div className="pdf-container">
        { loadingPdf &&  <div id="loaderSpinner" className="">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading PDF...</div>
        </div>}
         
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
          <button onClick={handleExtractionImages}> Extract Images</button>
        </div>
        {images.length > 0 && (
            <div className="image-section">
          <div className="header">
            <h1>All Images</h1>
            <div className="download-btn-all">
              <button onClick={handleDownloadAllImages}>
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
                Download All Images
              </button>
            </div>
          </div>

          <div className="image-container">
            {images.map((image,index) => (
              <div className="image-element" key={index}>
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
                  <button onClick={() => handleDownloadImage(index)} >
                    {" "}
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
                    Download Button
                  </button>

                </div>
                <div className="select-btn">
                    <select name="selectFormat" id="selectFormat" value={image.imageType} onChange={(event)=>handleFormatValue(event,index)}>
                        <option value="png" >PNG</option>
                        <option value="jpeg">JPEG</option>
                        <option value="webp">WEBP</option>
                    </select>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
        
      </div>
    </>
  );
}

export default App;
