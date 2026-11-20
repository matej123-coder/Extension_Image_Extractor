interface Props{ 
    setPdfUrl: React.Dispatch<React.SetStateAction<string | null>>;
    inputPdfUrl : string | null;
}

export default function PdfUrl({setPdfUrl,inputPdfUrl}: Props) {
    return (
        <>
            <div className="input-field">
                <div className="pdf-url-header">
                    <label htmlFor="pdfUrl">PDF URL</label>
                    <p>Enter the URL of a PDF file publicly accessible.</p>
                </div>

                <input
                    type="url"
                    id="pdfUrl"
                    name="pdfUrl"
                    value={inputPdfUrl || ""}
                    placeholder="https://example.com/document.pdf"
                    onChange={(event)=> setPdfUrl(event.target.value)}
                />

                <span className="pdf-url-hint">
                    You can also open a PDF in your browser and use its URL here.
                </span>
            </div>
        </>
    )
}