import type { ImageFormat } from "../types/types";

export default function convertImage(bitmap: ImageBitmap, format: ImageFormat) : Promise<Blob>{
    const canvas = document.createElement('canvas');

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Could not create canvas context');
    }

     ctx.drawImage(bitmap, 0, 0);

    const mimeType =
        format === 'png'
            ? 'image/png'
            : format === 'webp'
                ? 'image/webp'
                : 'image/jpeg';


    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Failed to convert image'));
                return;
            }

            resolve(blob);
        }, mimeType);
    });
} 