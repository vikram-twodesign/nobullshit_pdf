import { useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ThresholdControl } from "./threshold-control"

interface SignaturePadProps {
  onSignatureCapture: (signatureUrl: string) => void
}

export function SignaturePad({ onSignatureCapture }: SignaturePadProps) {
  const signaturePad = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [uploadedImage, setUploadedImage] = useState<string>("")
  const [processedImage, setProcessedImage] = useState<string>("")
  const { toast } = useToast()

  const handleClear = () => {
    signaturePad.current?.clear()
    setIsEmpty(true)
    setUploadedImage("")
    setProcessedImage("")
    onSignatureCapture("")
  }

  const handleSave = () => {
    if (uploadedImage) {
      // For uploaded images, use the processed version
      onSignatureCapture(processedImage || uploadedImage)
    } else if (signaturePad.current && !isEmpty) {
      // For drawn signatures, use as is
      const signatureUrl = signaturePad.current.toDataURL()
      onSignatureCapture(signatureUrl)
    } else {
      toast({
        title: "No signature found",
        description: "Please draw your signature first",
        variant: "destructive",
      })
      return
    }
    
    toast({
      title: "Signature saved!",
      description: "Now click on the PDF where you want it to appear",
    })
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        const signatureUrl = canvas.toDataURL()
        setUploadedImage(signatureUrl)
        setProcessedImage(signatureUrl) // Initial processed image is same as original
        setIsEmpty(false)
        
        toast({
          title: "Signature uploaded!",
          description: "Use the slider below to remove the background",
        })
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      {/* Drawing/Preview area */}
      <div className="border rounded-lg p-4 bg-background">
        {uploadedImage ? (
          <div className="flex items-center justify-center h-32 bg-white rounded border">
            <img 
              src={processedImage || uploadedImage} 
              alt="Uploaded signature" 
              className="max-h-24 max-w-full object-contain"
            />
          </div>
        ) : (
          <SignatureCanvas
            ref={signaturePad}
            canvasProps={{
              className: "w-full h-32 border rounded cursor-crosshair",
              style: { background: "white" }
            }}
            onBegin={() => setIsEmpty(false)}
          />
        )}
      </div>

      {/* Threshold control for uploaded images */}
      {uploadedImage && (
        <ThresholdControl
          originalImage={uploadedImage}
          onProcessedImage={setProcessedImage}
        />
      )}

      {/* Controls */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handleClear}
          className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all"
        >
          Clear
        </Button>
        <Button
          onClick={handleSave}
          className="flex-1 button-primary"
          disabled={isEmpty && !uploadedImage}
        >
          Use This
        </Button>
      </div>

      {/* Upload option */}
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          id="signature-upload"
        />
        <label htmlFor="signature-upload">
          <Button
            variant="outline"
            className="w-full"
            asChild
          >
            <span>📸 Upload a photo of your signature</span>
          </Button>
        </label>
      </div>
    </div>
  )
} 