import type { PDFDocumentProxy } from "pdfjs-dist";
import pdfjsLib from "./pdf";
import type { ExtractedImage, Images } from "../types/types";
import convertImage from "./convertImage";

export default async function extractImages(pdf: PDFDocumentProxy){
    const extractedImages: Images[] = [];
    for(let pageNumber = 1 ; pageNumber <= pdf.numPages; pageNumber++ ){
        
        const page = await pdf.getPage(pageNumber);

        const operatorList = await page.getOperatorList();
        
        for (let  i=0; i < operatorList.fnArray.length ; i++){
            const operation = operatorList.fnArray[i];

            if(operation === pdfjsLib.OPS.paintImageXObject){
                
                const args = operatorList.argsArray[i];

               const imageId = args[0];

              const image:ExtractedImage =  page.objs.get(imageId,(image: ExtractedImage)=>{
                    return image
               })
               
               extractedImages.push({
                image: convertImage(image.bitmap,'png'),
                imageType: 'png',
                width: image.width,
                height: image.height,
                pageNumber: pageNumber,
               });
               
            }
            
        }

    }

    return extractedImages;
    
}