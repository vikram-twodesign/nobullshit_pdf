import { useState, useRef, useEffect } from "react"
import { motion, PanInfo, useMotionValue } from "framer-motion"

interface SignaturePlacementProps {
  pdfPreviewRef: React.RefObject<HTMLDivElement>
  signatureUrl: string
  onPlacementChange?: (position: { x: number, y: number, scale: number }) => void
}

export function SignaturePlacement({ 
  pdfPreviewRef, 
  signatureUrl,
  onPlacementChange 
}: SignaturePlacementProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [scale, setScale] = useState(1)
  const signatureRef = useRef<HTMLDivElement>(null)
  
  // Motion values for smooth dragging
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Handle click on PDF to place signature
  const handlePdfClick = (e: React.MouseEvent) => {
    if (!pdfPreviewRef.current || position) return

    const rect = pdfPreviewRef.current.getBoundingClientRect()
    const newX = e.clientX - rect.left - 50 // Center the signature
    const newY = e.clientY - rect.top - 25

    setPosition({ x: newX, y: newY })
    x.set(newX)
    y.set(newY)
  }

  // Handle signature dragging
  const handleDrag = (_: any, info: PanInfo) => {
    if (!position || !pdfPreviewRef.current) return

    const rect = pdfPreviewRef.current.getBoundingClientRect()
    const newX = position.x + info.delta.x
    const newY = position.y + info.delta.y

    // Keep signature within PDF bounds
    const boundedX = Math.max(0, Math.min(newX, rect.width - 100))
    const boundedY = Math.max(0, Math.min(newY, rect.height - 50))

    setPosition({ x: boundedX, y: boundedY })
    x.set(boundedX)
    y.set(boundedY)
  }

  // Handle signature resizing
  const handleResize = (e: React.MouseEvent, corner: string) => {
    e.stopPropagation()
    const startX = e.clientX
    const startScale = scale

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX
      const scaleFactor = 0.01
      const newScale = Math.max(0.5, Math.min(2, startScale + delta * scaleFactor))
      setScale(newScale)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Notify parent of changes
  useEffect(() => {
    if (position && onPlacementChange) {
      onPlacementChange({ ...position, scale })
    }
  }, [position, scale, onPlacementChange])

  return (
    <>
      {/* Clickable overlay for initial placement */}
      {!position && (
        <div
          className="absolute inset-0 cursor-crosshair"
          onClick={handlePdfClick}
        />
      )}

      {/* Signature with drag and resize handles */}
      {position && (
        <motion.div
          ref={signatureRef}
          drag
          dragMomentum={false}
          onDrag={handleDrag}
          style={{ x, y }}
          className="absolute"
        >
          <div 
            className="relative group"
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'center'
            }}
          >
            {/* Signature image */}
            <img
              src={signatureUrl}
              alt="Signature"
              className="max-w-[200px] max-h-[100px] select-none"
              draggable={false}
            />
            
            {/* Resize handles */}
            <div className="absolute -right-2 -bottom-2 w-4 h-4 bg-primary rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleResize(e, 'se')}
            />
            <div className="absolute -left-2 -bottom-2 w-4 h-4 bg-primary rounded-full cursor-sw-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleResize(e, 'sw')}
            />
          </div>
        </motion.div>
      )}
    </>
  )
} 