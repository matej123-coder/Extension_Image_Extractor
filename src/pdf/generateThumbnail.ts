import type { PDFDocumentProxy } from "pdfjs-dist";

export default async function generatePdfThumbnail(pdf: PDFDocumentProxy) {
    const page = await pdf.getPage(1);

    const MAX_WIDTH = 250 ;
    const MAX_HEIGHT = 250;

    const initialViewport = page.getViewport({ scale: 1 });

    const scale = Math.min(
        MAX_WIDTH / initialViewport.width,
        MAX_HEIGHT / initialViewport.height,
        1
    );

    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("Could not create canvas context.");
    }

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({
        canvas,
        viewport,
    }).promise;

    return canvas.toDataURL("image/png");
}