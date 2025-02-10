import { PDFDocument } from 'pdf-lib'

interface SignaturePosition {
  x: number
  y: number
  scale: number
  pageIndex: number
}

export async function generateSignedPDF(
  pdfFile: File,
  signatureUrl: string,
  position: SignaturePosition
): Promise<Uint8Array> {
  try {
    // Load the PDF document
    const pdfBytes = await pdfFile.arrayBuffer()
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const pages = pdfDoc.getPages()
    const page = pages[position.pageIndex]

    // Get page dimensions
    const { width: pageWidth, height: pageHeight } = page.getSize()
    console.log('PDF dimensions:', { pageWidth, pageHeight })

    // Get preview container dimensions from the DOM
    const previewContainer = document.querySelector('[data-pdf-preview]') as HTMLDivElement
    if (!previewContainer) {
      throw new Error('Could not find PDF preview container')
    }
    const previewRect = previewContainer.getBoundingClientRect()
    console.log('Preview dimensions:', { 
      width: previewRect.width, 
      height: previewRect.height 
    })

    // Get the actual dimensions of the PDF preview within the container
    const previewAspectRatio = previewRect.width / previewRect.height
    const pdfAspectRatio = pageWidth / pageHeight
    
    let previewPdfWidth, previewPdfHeight
    if (previewAspectRatio > pdfAspectRatio) {
      // Preview is wider than PDF - PDF height matches container
      previewPdfHeight = previewRect.height
      previewPdfWidth = previewPdfHeight * pdfAspectRatio
    } else {
      // Preview is taller than PDF - PDF width matches container
      previewPdfWidth = previewRect.width
      previewPdfHeight = previewPdfWidth / pdfAspectRatio
    }

    // Calculate offsets for centering
    const xOffset = (previewRect.width - previewPdfWidth) / 2
    const yOffset = (previewRect.height - previewPdfHeight) / 2

    // Calculate scale factors
    const scale = pageWidth / previewPdfWidth // Use single scale factor to maintain proportions

    // Calculate signature dimensions based on preview size first
    const previewSignatureWidth = 200 * position.scale // Base preview width of 200px
    const previewSignatureHeight = previewSignatureWidth * 0.5 // 2:1 aspect ratio

    // Scale signature dimensions to PDF space
    const signatureWidth = previewSignatureWidth * scale
    const signatureHeight = previewSignatureHeight * scale

    console.log('Signature dimensions:', {
      previewWidth: previewSignatureWidth,
      previewHeight: previewSignatureHeight,
      pdfWidth: signatureWidth,
      pdfHeight: signatureHeight,
      scale
    })

    // Adjust position coordinates by removing the offset
    const adjustedX = position.x - xOffset
    const adjustedY = position.y - yOffset

    // Convert to PDF coordinates
    const pdfX = (adjustedX * scale) - 8 // Slight adjustment to the left
    const pdfY = pageHeight - (adjustedY * scale)

    console.log('Position calculations:', {
      previewPdfWidth,
      previewPdfHeight,
      xOffset,
      yOffset,
      adjustedX,
      adjustedY,
      scale,
      pdfX,
      pdfY
    })

    // Convert base64 signature to bytes
    const base64Data = signatureUrl.replace(/^data:image\/png;base64,/, '')
    const signatureBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

    // Embed the signature image
    const signatureImage = await pdfDoc.embedPng(signatureBytes)

    // Draw the signature
    page.drawImage(signatureImage, {
      x: pdfX,
      y: pdfY - signatureHeight, // Subtract signature height since PDF coordinates start from bottom
      width: signatureWidth,
      height: signatureHeight,
    })

    // Save the PDF
    return await pdfDoc.save()

  } catch (error: unknown) {
    console.error('Error generating signed PDF:', error)
    throw new Error(`Failed to generate signed PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
} 