import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';


interface Props {
    pdf: PDFDocumentProxy | null;
    pdfThumbnail: string | null;
    fileName: string | null;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}
export default function FileUploader({pdf,pdfThumbnail,fileName,handleFileChange}: Props) {
  return (
    <div className="input-field">
          <label htmlFor="pdf-upload" className="file-upload">
            {!pdf && (
              <>
                <span className="file-upload-icon">↑</span>
                <span className="file-upload-title">Choose a PDF</span>
                <span className="file-upload-text">
                  or drag and drop your file here
                </span>
              </>
            )}
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
            {pdfThumbnail && (
              <div className="pdf-thumbnail-container">
                <div className="pdf-thumbnail">
                  <img src={pdfThumbnail} alt="PDF first page preview" />
                </div>
                <div className="pdf-thumbnail-title">{fileName}</div>
              </div>
            )}
          </label>
        </div>
  )
}

