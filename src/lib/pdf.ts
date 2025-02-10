import * as PDFJS from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'
import type { PDFPageProxy } from 'pdfjs-dist'

// Set worker path
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker as unknown as string

export { PDFJS }
export type { PDFPageProxy } 