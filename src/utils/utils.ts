export default function hashPixels(data: Uint8ClampedArray): number {
  let hash = 0;

  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data[i];
    hash |= 0;
  }

  return hash;
}