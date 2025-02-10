import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
              mainClassName="text-primary-foreground dark:text-primary-foreground px-4 py-1 bg-primary dark:bg-primary rounded-lg inline-block"
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

      {/* Footer */}
      <footer className="max-w-3xl mx-auto mt-24 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-4 mb-4">
          <a 
            href="https://x.com/vikram_2dsgn" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a 
            href="mailto:vikram@twodesign.in"
            className="hover:text-primary transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2">
              <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </a>
        </div>
        <p>© {new Date().getFullYear()} No BS PDF — Made with �� to complexity</p>
      </footer>
    </div>
  )
} 