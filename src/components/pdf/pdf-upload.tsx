import { useCallback, useState, useRef, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { type PDFDocument } from "@/types"
import { PDFJS, type PDFPageProxy } from "@/lib/pdf"
import { SignaturePlacement } from "@/components/signature/signature-placement"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

interface PDFPreview extends PDFDocument {
  pages: string[]
  currentPage: number
  totalPages: number
}

interface SignaturePosition {
  x: number
  y: number
  scale: number
  pageIndex: number
}

interface PDFUploadProps {
  signatureUrl: string
  onPDFSelect?: (file: File | null) => void
  onSignaturePlacement?: (position: SignaturePosition | null) => void
}

export function PDFUpload({ 
  signatureUrl, 
  onPDFSelect,
  onSignaturePlacement 
}: PDFUploadProps) {
  const [pdf, setPdf] = useState<PDFPreview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()
  const pdfPreviewRef = useRef<HTMLDivElement>(null)
  const [signaturePosition, setSignaturePosition] = useState<{ x: number, y: number, scale: number } | null>(null)

  // Update parent when signature position changes
  useEffect(() => {
    if (onSignaturePlacement) {
      onSignaturePlacement(
        signaturePosition && pdf 
          ? { ...signaturePosition, pageIndex: pdf.currentPage - 1 }
          : null
      )
    }
  }, [signaturePosition, pdf?.currentPage, onSignaturePlacement])

  const renderPage = async (page: PDFPageProxy, scale = 1.0) => {
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    canvas.height = viewport.height
    canvas.width = viewport.width

    await page.render({
      canvasContext: context!,
      viewport: viewport
    }).promise

    return canvas.toDataURL()
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    
    if (!file) return
    
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      })
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload a PDF smaller than 10MB",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setUploadProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFJS.getDocument(arrayBuffer).promise
      const totalPages = pdfDoc.numPages
      const pagePromises = []

      // Generate previews for all pages
      for (let i = 1; i <= totalPages; i++) {
        const page = await pdfDoc.getPage(i)
        pagePromises.push(renderPage(page))
      }

      const pages = await Promise.all(pagePromises)

      clearInterval(progressInterval)
      setUploadProgress(100)

      const newPdf = {
        file,
        pages,
        currentPage: 1,
        totalPages,
      }
      setPdf(newPdf)
      onPDFSelect?.(file)

      toast({
        title: "PDF uploaded!",
        description: `${totalPages} page${totalPages > 1 ? 's' : ''} ready for signing`,
      })
    } catch (error) {
      console.error("Error processing PDF:", error)
      toast({
        title: "Error processing PDF",
        description: "Please try uploading again",
        variant: "destructive",
      })
      onPDFSelect?.(null)
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }, [toast, onPDFSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"]
    },
    maxFiles: 1,
  })

  const changePage = (delta: number) => {
    if (!pdf) return
    const newPage = pdf.currentPage + delta
    if (newPage >= 1 && newPage <= pdf.totalPages) {
      setPdf(prev => prev ? { ...prev, currentPage: newPage } : null)
      // Reset signature position when changing pages
      setSignaturePosition(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area - Only show when no PDF is loaded */}
      <AnimatePresence>
        {!pdf && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 transition-colors duration-200 cursor-pointer
                ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
                ${isLoading ? "pointer-events-none opacity-50" : ""}
              `}
            >
              <input {...getInputProps()} />
              <div className="text-center space-y-4">
                <div className="text-4xl">📄</div>
                {isDragActive ? (
                  <p className="text-primary">Drop your PDF here...</p>
                ) : (
                  <div className="space-y-2">
                    <p>Drag & drop your PDF here, or click to browse</p>
                    <p className="text-sm text-muted-foreground">
                      Max file size: 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">
              Processing your PDF...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview */}
      <AnimatePresence>
        {pdf && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div ref={pdfPreviewRef} data-pdf-preview className="aspect-[1/1.4] relative rounded-lg overflow-hidden border">
              <img
                src={pdf.pages[pdf.currentPage - 1]}
                alt={`PDF preview - Page ${pdf.currentPage}`}
                className="absolute inset-0 w-full h-full object-contain bg-white"
              />
              
              {/* Instructions overlay */}
              {!signaturePosition && signatureUrl && (
                <div className="absolute top-4 left-0 right-0 text-center">
                  <div className="inline-block bg-black/75 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                    👆 Click where you want your signature to land
                  </div>
                </div>
              )}

              {/* No signature warning */}
              {!signatureUrl && (
                <div className="absolute top-4 left-0 right-0 text-center">
                  <div className="inline-block bg-black/75 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                    ✍️ Draw your signature below first
                  </div>
                </div>
              )}
              
              {/* Signature placement overlay */}
              {signatureUrl && (
                <SignaturePlacement
                  pdfPreviewRef={pdfPreviewRef}
                  signatureUrl={signatureUrl}
                  onPlacementChange={setSignaturePosition}
                />
              )}
              
              {/* Page navigation overlay */}
              {pdf.totalPages > 1 && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                  <div className="flex items-center justify-between text-white">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(-1)}
                      disabled={pdf.currentPage === 1}
                      className="bg-black/75 hover:bg-black text-white border-white/20 backdrop-blur-sm"
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-medium px-3 py-1 rounded bg-black/75 backdrop-blur-sm">
                      Page {pdf.currentPage} of {pdf.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changePage(1)}
                      disabled={pdf.currentPage === pdf.totalPages}
                      className="bg-black/75 hover:bg-black text-white border-white/20 backdrop-blur-sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm truncate flex-1">
                {pdf.file.name}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPdf(null)}
                className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all"
              >
                Change PDF
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 