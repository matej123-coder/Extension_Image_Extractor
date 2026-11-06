import type { PDFOperatorList } from "pdfjs-dist/types/src/display/api";

export default function hashPixels(data: Uint8ClampedArray): number {
  let hash = 0;

  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data[i];
    hash |= 0;
  }

  return hash;
}
export function isOverlay(entry: PDFOperatorList,i:number) {
  const prev = entry.argsArray.slice(i - 10, i);

  const groups = prev.filter(
    a => Array.isArray(a) && a[0] && typeof a[0] === "object" && "hasSoftMask" in a[0]
  );
  const g = groups[groups.length - 1]?.[0];
  if (!g?.hasSoftMask) return false;

  const hasSMaskOn = prev.some(
    a => Array.isArray(a) && Array.isArray(a[0]) &&
         a[0].some(p => Array.isArray(p) && p[0] === "SMask" && p[1] === true)
  );
  if (hasSMaskOn) return false;

  // transform may be flipped (negative a or d), so normalize the rect
  const [a, , , d, e, f] = prev[8];
  const xMin = Math.min(e, e + a), xMax = Math.max(e, e + a);
  const yMin = Math.min(f, f + d), yMax = Math.max(f, f + d);
  const [x0, y0, x1, y1] = g.bbox;
  const tol = 0.5;

  return (
    Math.abs(x0 - xMin) < tol && Math.abs(y0 - yMin) < tol &&
    Math.abs(x1 - xMax) < tol && Math.abs(y1 - yMax) < tol
  );
}