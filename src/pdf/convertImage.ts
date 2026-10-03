import type { ImageFormat } from "../types/types";

export default function convertImage(
  bitmap: ImageBitmap | VideoFrame,
  format: ImageFormat,
  imageId: string,
): Promise<Blob | null> {
  try {
    const canvas = document.createElement("canvas");

    if (bitmap instanceof ImageBitmap) {
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
    } else {
      canvas.width = bitmap.codedWidth;
      canvas.height = bitmap.codedHeight;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return Promise.resolve(null);
    }

    ctx.drawImage(bitmap, 0, 0);

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
