import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface ThresholdControlProps {
  originalImage: string
  onProcessedImage: (dataUrl: string) => void
}

export function ThresholdControl({ originalImage, onProcessedImage }: ThresholdControlProps) {
  const [threshold, setThreshold] = useState(240)

  useEffect(() => {
    const processImage = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = img.width
        canvas.height = img.height
        
        // Draw original image
        ctx.drawImage(img, 0, 0)
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Apply threshold
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          
          // Calculate brightness (simple average)
          const brightness = (r + g + b) / 3
          
          // If brightness is above threshold, make pixel transparent
          if (brightness > threshold) {
            data[i + 3] = 0 // Alpha channel
          }
        }

        // Put processed image data back
        ctx.putImageData(imageData, 0, 0)
        
        // Convert to data URL and emit
        onProcessedImage(canvas.toDataURL())
      }
      img.src = originalImage
    }

    processImage()
  }, [originalImage, threshold, onProcessedImage])

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="threshold">Background Removal</Label>
        <span className="text-sm text-muted-foreground">
          Threshold: {threshold}
        </span>
      </div>
      <Slider
        id="threshold"
        min={0}
        max={255}
        step={1}
        value={[threshold]}
        onValueChange={([value]) => setThreshold(value)}
        className="cursor-pointer"
      />
      <p className="text-sm text-muted-foreground">
        Adjust the slider to remove the background. Higher values remove more white.
      </p>
    </div>
  )
} 