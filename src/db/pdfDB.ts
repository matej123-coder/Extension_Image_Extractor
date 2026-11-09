import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import generatePdfThumbnail from "../pdf/generateThumbnail";
import pdfjsLib from "../pdf/pdf";

const DB_NAME = "pdf"
const STORE_NAME = "pdf_info"
const DB_VERSION = 1;

interface PDFInfo {
    id: string;
    pdfFileName: string;
    pdf: Uint8Array;
    expiresAt: number;

}   

export default function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }


    }
    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
export async function savePDFInfo(pdf: PDFDocumentProxy, pdfFileName: string | null,): Promise<void> {
    const db = await openDatabase();
    const pdfFileInfo = await pdf.getData();
    return  new  Promise( (resolve, reject)=>{
        const transaction = db.transaction(STORE_NAME,"readwrite");

        const store  = transaction.objectStore(STORE_NAME)

        if(!pdfFileName){
            return;
        }
        
        const pdfInfo: PDFInfo = {
            id: 'current',
            pdfFileName: pdfFileName,
            pdf: new Uint8Array(pdfFileInfo),
            expiresAt: Date.now() + 20 * 60 * 1000,


        }
        store.clear();
        store.put(pdfInfo);

        transaction.oncomplete=()=>{
            db.close();
            resolve();
        }
        transaction.onerror=()=>{
            db.close();
            reject(transaction.error);
        }
        
        transaction.onabort=()=>{
            db.close();
            reject(transaction.error);
        }
    })
}

export async function retrievePDFInfo() : Promise<{ 
    pdfFileName: string;
    pdf: PDFDocumentProxy;
    thumbnail: string;}>
 {
    const db = await openDatabase();

    return new Promise((resolve,reject) =>{
       const transaction = db.transaction(STORE_NAME,"readwrite");
       const store  = transaction.objectStore(STORE_NAME);
       const request = store.get("current");
       request.onsuccess= async ()=>{
         const session = request.result as PDFInfo | undefined;

         if(!session || Date.now() > session.expiresAt){
            store.clear();
            return;
         }
         
         const pdf = await pdfjsLib.getDocument({
            data: new Uint8Array(session.pdf)
         }).promise

         const thumbnail = await generatePdfThumbnail(pdf);
         resolve({
            pdf,
            pdfFileName : session.pdfFileName,
            thumbnail
         })
       }
       request.onerror=()=>{
        reject(request.error)
       }
       transaction.oncomplete = () =>{
        db.close();

       }
       transaction.onerror = () =>{
         db.close();
         reject(transaction.error);
       }

    })
    
}