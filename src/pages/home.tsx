import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PDFUpload } from "@/components/pdf/pdf-upload"
import { SignaturePad } from "@/components/signature/signature-pad"
import { generateSignedPDF } from "@/lib/pdf-generator"
import { useToast } from "@/hooks/use-toast"
import { TextRotate } from "@/components/ui/text-rotate"

interface SignaturePosition {
  x: number
  y: number
  scale: number
  pageIndex: number
}

export function HomePage() {
  const [signatureUrl, setSignatureUrl] = useState<string>("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [signaturePosition, setSignaturePosition] = useState<SignaturePosition | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handlePDFGenerate = async () => {
    if (!pdfFile || !signatureUrl || !signaturePosition) {
      toast({
        title: "Can't generate PDF yet",
        description: "Make sure you've uploaded a PDF and placed your signature on it",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const pdfBytes = await generateSignedPDF(pdfFile, signatureUrl, signaturePosition)
      
      // Create blob and download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `signed_${pdfFile.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "PDF signed and ready!",
        description: "Your signed PDF is downloading...",
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: "Something went wrong",
        description: "Failed to generate the signed PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto py-16 px-4">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-24">
        <motion.h1 className="relative flex flex-col items-center justify-center text-5xl font-bold tracking-tight mb-24 mt-24">
          <motion.div className="inline-flex items-baseline">
            <span className="whitespace-nowrap">PDF Signing without</span>
          </motion.div>
          <motion.div className="flex items-baseline mt-2">
            <span className="mr-2">the</span>
            <TextRotate
              texts={[
                "hassle",
                "sign-ups",
                "complexity",
                "confusion",
                "nonsense",
                "frustration",
                "bloat",
                "bullshit"
              ]}
              mainClassName="text-white px-4 py-1 bg-primary rounded-lg inline-block"
              staggerFrom="last"
              staggerDuration={0.025}
              rotationInterval={2000}
            />
          </motion.div>
        </motion.h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-24">
          Upload your PDF, Sign it, and GTFO. 🎯
        </p>
      </div>

      {/* Main Content */}
      <div className="desktop-grid">
        {/* Left Column - Signature */}
        <div className="space-y-8">
          <Card className="card-hover">
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">✍️</span> First, Drop Your Signature Here
              </CardTitle>
              <CardDescription className="space-y-2">
                <p>Draw it with your mouse/touchpad like it's 1999</p>
                <p className="text-sm">
                  Or if you're old school (we see you 👀), snap a pic of your handwritten signature and drop it below
                </p>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignaturePad onSignatureCapture={setSignatureUrl} />
            </CardContent>
          </Card>

          {/* Action Button - Only show on mobile */}
          <div className="text-center space-y-4 md:hidden">
            <Button 
              size="lg" 
              className="w-full max-w-sm text-lg h-12 button-primary"
              onClick={handlePDFGenerate}
              disabled={isGenerating || !signatureUrl || !pdfFile || !signaturePosition}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Your PDF...
                </span>
              ) : (
                "Grab Your Signed PDF & Go"
              )}
            </Button>
          </div>
        </div>

        {/* Right Column - PDF Upload and Preview */}
        <div className="space-y-8">
          <Card className="card-hover">
            <CardHeader className="space-y-3">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📄</span> Then, Add Your PDF Here
              </CardTitle>
              <CardDescription>
                That boring contract you need to sign? Yeah, drop it right here →
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PDFUpload 
                signatureUrl={signatureUrl}
                onPDFSelect={setPdfFile}
                onSignaturePlacement={setSignaturePosition}
              />
            </CardContent>
          </Card>

          {/* Action Button - Only show on desktop */}
          <div className="hidden md:block text-center space-y-4">
            <Button 
              size="lg" 
              className="w-full max-w-sm text-lg h-12 button-primary"
              onClick={handlePDFGenerate}
              disabled={isGenerating || !signatureUrl || !pdfFile || !signaturePosition}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Your PDF...
                </span>
              ) : (
                "Grab Your Signed PDF & Go"
              )}
            </Button>
            <p className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Your files stay on your device. No sneaky business here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 