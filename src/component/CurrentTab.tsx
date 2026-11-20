import type { CheckBoxOptions } from "../types/types";

interface CurrentTabProps {
    pdfUrl: string | null;
    setCheckBoxValue: React.Dispatch<React.SetStateAction<CheckBoxOptions>>;
}

export default function CurrentTab({ pdfUrl,setCheckBoxValue }: CurrentTabProps) {
    const isPdfAvailable = !!pdfUrl;


    return (
        <div className="current-tab-container">
            <div className="current-tab-header">
                <label>Current Browser Tab</label>
                <p>Extract images directly from the PDF currently open in your browser.</p>
            </div>

            <div className={`current-tab-status ${isPdfAvailable ? "available" : "unavailable"}`}>
                <div className="status-indicator"></div>

                <div className="status-content">
                    <span className="status-title">
                        {isPdfAvailable ? "PDF detected" : "No PDF detected"}
                    </span>

                    <span className="status-description">
                        {isPdfAvailable
                            ? "A PDF file is ready to be processed."
                            : "The current tab does not appear to contain a PDF file."}
                    </span>
                </div>
            </div>

            
                <div className="current-tab-hint">
                    Open a PDF file in your browser please make sure it is publicly accessible, then reopen ImageKO to detect it.
                    Alternatively, select the <a className="link-pdf" onClick={()=> setCheckBoxValue('pdfUrl')}> PDF URL</a> or <a className="link-pdf" onClick={()=>setCheckBoxValue("fileUpload")}>Upload PDF</a> option.
                </div>
        </div>
    );
}