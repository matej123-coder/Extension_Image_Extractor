import type { PDFDocumentProxy } from "pdfjs-dist";
import pdfjsLib from "./pdf";
import type { ExtractedImage, Images } from "../types/types";
import convertImage from "./convertImage";

export default async function extractImages(pdf: PDFDocumentProxy) {
    const extractedImages: Images[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

        const page = await pdf.getPage(pageNumber);
        const operatorList = await page.getOperatorList();

        for (let i = 0; i < operatorList.fnArray.length; i++) {

            const operation = operatorList.fnArray[i];

            if (operation !== pdfjsLib.OPS.paintImageXObject) {
                continue;
            }

            const imageId = operatorList.argsArray[i][0];

            console.log("Image operation:", {
                pageNumber,
                 imageId,
                operation
                });
            const image = await new Promise<ExtractedImage>((resolve) => {
                page.objs.get(imageId, (image:ExtractedImage) => {
                    console.log("Retrieved Image",{
                        pageNumber,
                        imageId,
                        image   
                    })
                    resolve(image);
                });
            });

            const blob = await convertImage(image.bitmap, "png");

            extractedImages.push({
                image: blob,
                imageUrl:  URL.createObjectURL(blob),
                imageType: "png",
                width: image.width,
                height: image.height,
                pageNumber
            });
        }
    }

    return extractedImages;
}