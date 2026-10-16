import type { PDFDocumentProxy } from "pdfjs-dist";
import pdfjsLib from "./pdf";
import type { ExtractedImage, Images } from "../types/types";
import convertImage from "./convertImage";
import getImageCoordinates from "./getImageCoordinates";

const CONCURECY_LIMIT = 2;

export default async function extractImages(pdf: PDFDocumentProxy) {
  const extractedImages: Images[] = [];
  const hashes = new Set<number>();
  const candidate= new Map<string, HTMLCanvasElement | null>();

  for (let start = 1; start <= pdf.numPages; start += CONCURECY_LIMIT) {
    const end = Math.min(start + CONCURECY_LIMIT - 1, pdf.numPages);

    const pageNumbers = [];
    for (let pageNumber = start; pageNumber <= end; pageNumber++) {
      pageNumbers.push(pageNumber);
    }
    const pageImages = await Promise.all(
      pageNumbers.map((pageNumber) => processPage(pageNumber, pdf, hashes,candidate)),
    );
    for (const pageNumber of pageImages) {
      extractedImages.push(...pageNumber);
    }
  }

  return extractedImages;
}
async function processPage(
  pageNumber: number,
  pdf: PDFDocumentProxy,
  hashes: Set<number>,
  candidate: Map<string,HTMLCanvasElement | null>,
): Promise<Images[]> {
  console.log("Processing page:", pageNumber);
  const page = await pdf.getPage(pageNumber);

 const{rects} =  await getImageCoordinates(page)

  
  const operatorList = await page.getOperatorList();

  const pageImages: Images[] = [];

  let paintIndex = -1;
  for (let i = 0; i < operatorList.fnArray.length; i++) {
    const operation = operatorList.fnArray[i];

    if (operation !== pdfjsLib.OPS.paintImageXObject) {
      continue;
    }
    paintIndex++;
    const position = rects[paintIndex] ?? null
    if (operatorList.fnArray[i - 5] === pdfjsLib.OPS.paintFormXObjectBegin) {
      continue;
    }

    const imageId = operatorList.argsArray[i][0];

    
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
    
    const blob = await convertImage(image.bitmap, "png", imageId,hashes,candidate);
    
    if (!blob) {
      continue;
    }
    console.log(image)

    pageImages.push({
      image: blob,
      imageUrl: URL.createObjectURL(blob),
      imageType: "png",
      width: image.width,
      height: image.height,
      pageNumber,
      position
    });
  }
  console.log(pageImages)
  return pageImages;
}
