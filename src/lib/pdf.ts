import * as PDFJS from 'pdfjs-dist'
import type { PDFPageProxy } from 'pdfjs-dist'

// Initialize PDF.js worker
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry')
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker

export const pdfjs = PDFJS
export type { PDFPageProxy } 