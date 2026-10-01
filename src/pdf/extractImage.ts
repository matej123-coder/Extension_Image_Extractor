import type { PDFDocumentProxy } from "pdfjs-dist";
import pdfjsLib from "./pdf";
import type { ExtractedImage, Images } from "../types/types";
import convertImage from "./convertImage";

export default async function extractImages(pdf: PDFDocumentProxy) {
    const extractedImages: Images[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        console.log(`Processing page ${pageNumber}`);

        const page = await pdf.getPage(pageNumber);
        const operatorList = await page.getOperatorList();

        for (let i = 0; i < operatorList.fnArray.length; i++) {
            const operation = operatorList.fnArray[i];

            if (
                operation !== pdfjsLib.OPS.paintImageXObject
            ) {
                continue;
            }

            const imageId = operatorList.argsArray[i][0];

            console.log("Image operation:", {
                pageNumber,
                imageId,
                operation,
            });

            const image = await new Promise<ExtractedImage | null>((resolve) => {
                let resolved = false;

                const timeout = setTimeout(() => {
                    if (!resolved) {
                        console.warn("TIMEOUT getting image:", {
                            pageNumber,
                            imageId,
                        });

                        resolved = true;
                        resolve(null);
                    }
                }, 1000);

                page.objs.get(imageId, (image: ExtractedImage | null) => {
                    if (resolved) return;

                    resolved = true;
                    clearTimeout(timeout);

                    console.log("Retrieved Image:", {
                        pageNumber,
                        imageId,
                        image,
                    });

                    resolve(image);
                });
            });

            if (!image) {
                console.warn("Image object is null:", {
                    pageNumber,
                    imageId,
                });

                continue;
            }
            console.log("IMAGE DEBUG", {
                imageId,
                width: image.width,
                height: image.height,
                bitmap: image.bitmap,
                keys: Object.keys(image),
                values: Object.fromEntries(
                    Object.entries(image).filter(
                        ([key]) => key !== "bitmap"
                    )
                ),
            });
            console.log("BEFORE convertImage:", {
                pageNumber,
                imageId,
                width: image.width,
                height: image.height,
                bitmap: image.bitmap,
            });

            const blob = await convertImage(image.bitmap, "png");

            console.log("AFTER convertImage:", {
                pageNumber,
                imageId,
                blob,
                size: blob.size,
                type: blob.type,
            });

            extractedImages.push({
                image: blob,
                imageUrl: URL.createObjectURL(blob),
                imageType: "png",
                width: image.width,
                height: image.height,
                pageNumber,
            });

            console.log("Image added:", extractedImages.length);
            console.log("Images till now", extractedImages)
        }
    }

    console.log("FINAL extractedImages:", extractedImages);

    return extractedImages;
} 