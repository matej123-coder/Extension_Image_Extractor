import "../polyfill.ts";

import * as pdfjsLib from "pdfjs-dist";

import PdfWorker from "./pdf.worker.ts?worker";

pdfjsLib.GlobalWorkerOptions.workerPort = new PdfWorker();

export default pdfjsLib;
