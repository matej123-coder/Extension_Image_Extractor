import type { ImageFormat } from "../types/types";
import hashPixels from "../utils/utils";

export default function convertImage(
  bitmap: ImageBitmap | VideoFrame,
  format: ImageFormat,
  imageId: string,
  hashes: Set<number>,
  //hashes16Pixels: Set<number>
): Promise<Blob | null> {
  try {
    
    const canvas = document.createElement("canvas");

    canvas.width =
    bitmap instanceof VideoFrame
        ? bitmap.displayWidth
        : bitmap.width;

    canvas.height =
    bitmap instanceof VideoFrame
        ? bitmap.displayHeight
        : bitmap.height;
    
   
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return Promise.resolve(null);
    }
    ctx.drawImage(bitmap, 0, 0)

    
    // const hash16Pixels = hashPixels(ctx.getImageData(0,0,4,4).data);

    // if(hashes16Pixels.has(hash16Pixels)){
    //     return Promise.resolve(null);
    // }
    // hashes16Pixels.add(hash16Pixels);

    

    const hash = hashPixels(ctx.getImageData(0,0,canvas.width,canvas.height).data);
    
    if(hashes.has(hash)){
        return Promise.resolve(null);
    }
    hashes.add(hash)

    const mimeType =
      format === "png"
        ? "image/png"
        : format === "webp"
          ? "image/webp"
          : "image/jpeg";



    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.warn("Hello i didn't converted", imageId);
          resolve(null);
          return;
        }

        resolve(blob);
      }, mimeType);
    });
  } catch (error) {
    console.warn("Exception while converting image:", {
      imageId,
      error,
    });

    return Promise.resolve(null);
  }
}
