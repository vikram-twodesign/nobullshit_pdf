export interface PDFDocument {
  file: File
  preview?: string
}

export interface Signature {
  image: string
  position?: {
    x: number
    y: number
    scale: number
    page: number
  }
} 