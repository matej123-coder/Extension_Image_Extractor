import type { PDFPageProxy, PageViewport } from "pdfjs-dist";

export interface ImageRect {
  x: number;      // left, in PDF points, origin top-left (assuming top-down Y, see the test below)
  y: number;      // top
  width: number;
  height: number;
}

const RENDER_SCALE = 1.5;

export function parseImageCoordinates(
  coords: ArrayLike<number>,
  pageWidth: number,   // page width in points (scale 1)
  pageHeight: number,
): ImageRect[] {
  const rects: ImageRect[] = [];

  for (let i = 0; i + 5 < coords.length; i += 6) {
    const p0 = { x: coords[i], y: coords[i + 1] };
    const p1 = { x: coords[i + 2], y: coords[i + 3] };
    const p2 = { x: coords[i + 4], y: coords[i + 5] };
    const p3 = { x: p1.x + p2.x - p0.x, y: p1.y + p2.y - p0.y };

    const xs = [p0.x, p1.x, p2.x, p3.x];
    const ys = [p0.y, p1.y, p2.y, p3.y];
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);

    rects.push({
      x: minX * pageWidth,
      y: minY * pageHeight,
      width: (maxX - minX) * pageWidth,
      height: (maxY - minY) * pageHeight,
    });
  }
  return rects;
}

export default async function getImageCoordinates(page: PDFPageProxy) {
  const viewport: PageViewport = page.getViewport({ scale: RENDER_SCALE });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  await page.render({ canvas, viewport, recordImages: true }).promise;

  const raw = (page as PDFPageProxy & { imageCoordinates?: ArrayLike<number> })
    .imageCoordinates;

  const rects = raw
    ? parseImageCoordinates(
        raw,
        viewport.width / RENDER_SCALE,
        viewport.height / RENDER_SCALE,
      )
    : [];

  // canvas + viewport are returned so you can debug-draw (see testing section)
  return { rects, canvas, viewport };
}