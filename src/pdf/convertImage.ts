import type { ImageFormat } from "../types/types";
import hashPixels from "../utils/utils";

export default function convertImage(
    bitmap: ImageBitmap | VideoFrame,
    format: ImageFormat,
    imageId: string,
    hashes: Set<number>,
    candidate: Map<string, HTMLCanvasElement | null>
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

        const mimeType =
            format === "png"
                ? "image/png"
                : format === "webp"
                    ? "image/webp"
                    : "image/jpeg";

        const hash16Pixels = hashPixels(ctx.getImageData(Math.max(0, (canvas.width >> 1) - 2),
            Math.max(0, (canvas.height >> 1) - 2),
            Math.min(4, canvas.width),
            Math.min(4, canvas.height)).data
        )

        const key = `${canvas.width}x${canvas.height}:${hash16Pixels}`

        if (!candidate.has(key)) {
            candidate.set(key, canvas)
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
        }

        const first = candidate.get(key);

        if (first) {
            const firstHash = fullHash(first)

            if (firstHash === null) {
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
            }
            hashes.add(firstHash);
            candidate.set(key, null);

        }

        const hash = hashPixels(ctx.getImageData(0, 0, canvas.width, canvas.height).data);

        if (hashes.has(hash)) {
            return Promise.resolve(null);
        }
        hashes.add(hash)

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

function fullHash(c: HTMLCanvasElement): number | null {
    const ctx = c.getContext("2d");
    if (!ctx) {
        return null;
    }
    return hashPixels(ctx.getImageData(0, 0, c.width, c.height).data)
}