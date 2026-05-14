import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { UploadSection } from "@/components/landing/upload-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { ProcessingPreview } from "@/components/landing/processing-preview"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <UploadSection />
      <FeaturesSection />
      <ProcessingPreview />
      <Footer />
    </main>
  )
}
