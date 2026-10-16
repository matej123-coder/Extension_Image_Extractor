import type { PageViewport } from "pdfjs-dist";

export interface ImageRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function parseImageCoordinates(
  coords: ArrayLike<number>,
  viewport: PageViewport,
): ImageRect[] {
  const rects: ImageRect[] = [];

  for (let i = 0; i + 5 < coords.length; i += 6) {
    const p0 = { x: coords[i], y: coords[i + 1] };
    const p1 = { x: coords[i + 2], y: coords[i + 3] };
    const p2 = { x: coords[i + 4], y: coords[i + 5] };
    // 4th corner, so rotated/skewed images still get a correct bounding box
    const p3 = { x: p1.x + p2.x - p0.x, y: p1.y + p2.y - p0.y };

    const xs = [p0.x, p1.x, p2.x, p3.x];
    const ys = [p0.y, p1.y, p2.y, p3.y];

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    rects.push({
      x: minX * viewport.width,
      y: minY * viewport.height,
      width: (maxX - minX) * viewport.width,
      height: (maxY - minY) * viewport.height,
    });
  }
  return rects;
}