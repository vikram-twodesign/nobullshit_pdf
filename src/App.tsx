import { ThemeProvider } from "@/components/theme/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { HomePage } from "@/pages/home"
import { Analytics } from "@vercel/analytics/react"
import { ThemeToggle } from "@/components/theme/theme-toggle"

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <ThemeToggle />
        <HomePage />
        <Toaster />
        <Analytics />
      </div>
    </ThemeProvider>
  )
}
