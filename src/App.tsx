import { ThemeProvider } from "@/components/theme/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { HomePage } from "@/pages/home"
import { Analytics } from "@vercel/analytics/react"

export default function App() {
  return (
    <ThemeProvider>
      <HomePage />
      <Toaster />
      <Analytics />
    </ThemeProvider>
  )
}
