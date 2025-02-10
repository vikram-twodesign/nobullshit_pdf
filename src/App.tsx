import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { HomePage } from "@/pages/home"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { ThemeToggle } from "@/components/theme/theme-toggle"

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Router>
        <main className="min-h-screen bg-background antialiased">
          <ThemeToggle />
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
          <Toaster />
        </main>
      </Router>
    </ThemeProvider>
  )
}
