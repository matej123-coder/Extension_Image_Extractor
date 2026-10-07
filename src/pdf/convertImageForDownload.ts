import type { ImageFormat } from "../types/types";

export default async function convertImageForDownload(blob: Blob, imageId:string, format:ImageFormat) : Promise<Blob | null>{
    try {
        const bitmap = await createImageBitmap(blob);

        const canvas = document.createElement("canvas");

        const width =
            bitmap instanceof VideoFrame
                ? bitmap.displayWidth
                : bitmap.width;

        const height =
            bitmap instanceof VideoFrame
                ? bitmap.displayHeight
                : bitmap.height;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
         bitmap.close();
         return null;
        }

   
    
        const mimeType =
         format === "png"
            ? "image/png"
            : format === "webp"
              ? "image/webp"
              : "image/jpeg";
    
    
    if (mimeType === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF"; 
        ctx.fillRect(0, 0, width, height);
    }
     ctx.drawImage(bitmap, 0, 0)
    
     bitmap.close();
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