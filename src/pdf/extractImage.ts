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

      if (operation !== pdfjsLib.OPS.paintImageXObject) {
        continue;
      }

      if (operatorList.fnArray[i - 5] === pdfjsLib.OPS.paintFormXObjectBegin) {
        continue;
      }

      const imageId = operatorList.argsArray[i][0];

      // console.log("Image operation:", {
      //     pageNumber,
      //     imageId,
      //     operation,
      // });

      const image = await new Promise<ExtractedImage | null>((resolve) =>
        (imageId.startsWith("g_") ? page.commonObjs : page.objs).get(
          imageId,
          resolve,
        ),
      );

      if (!image || !image.bitmap || !image.width || !image.height) {
        console.warn("Image object is null:", {
          pageNumber,
          imageId,
        });
        continue;
      }
      //   console.log("IMAGE DEBUG", {
      //     imageId,
      //     width: image.width,
      //     height: image.height,
      //     bitmap: image.bitmap,
      //     keys: Object.keys(image),
      //     values: Object.fromEntries(
      //       Object.entries(image).filter(([key]) => key !== "bitmap"),
      //     ),
      //   });

      // const previousOperations = [74, 10, 9, 12, 1];

      // console.log(
      //     previousOperations.map(op => ({
      //         op,
      //         name: Object.entries(pdfjsLib.OPS).find(
      //             ([, value]) => value === op
      //         )?.[0],
      //     }))
      // );
      //     console.log("Previous operations:",{
      //         index: i,
      //         operation: operation,
      //         previousOperations:   previousOperations.map(op => ({
      //              op,
      //             name: Object.entries(pdfjsLib.OPS).find(
      //         ([, value]) => value === op
      //          )?.[0],
      //         })),
      //     previousArguments: operatorList.fnArray.slice(
      //         Math.max(0, i - 5),
      //         i
      //     ),
      //      previousArgs: operatorList.argsArray.slice(
      //     Math.max(0, i - 5),
      //     i
      // ),
      //     });
      // console.log("BEFORE convertImage:", {
      //     pageNumber,
      //     imageId,
      //     width: image.width,
      //     height: image.height,
      //     bitmap: image.bitmap,
      // });

      const blob = await convertImage(image.bitmap, "png", imageId);

      if (!blob) {
        console.warn("It failed to convert this image");
        continue;
      }

      // console.log("AFTER convertImage:", {
      //     pageNumber,
      //     imageId,
      //     blob,
      //     size: blob.size,
      //     type: blob.type,
      // });

      extractedImages.push({
        image: blob,
        imageUrl: URL.createObjectURL(blob),
        imageType: "png",
        width: image.width,
        height: image.height,
        pageNumber,
      });
    }
  }

//   console.log("FINAL extractedImages:", extractedImages);

  return extractedImages;
}
