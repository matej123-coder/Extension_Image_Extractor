import pdfjsLib from "./pdf";

export async function loadPdf(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, wasmUrl: "/pdfjs/wasm/node_modules/pdfjs-dist/wasm/" }).promise;

  console.log("PDF loaded");
  console.log("Number of pages:", pdf.numPages);

  return pdf;
}
