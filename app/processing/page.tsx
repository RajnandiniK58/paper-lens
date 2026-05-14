import type { Metadata } from "next"
import { Suspense } from "react"

import { ProcessingShell } from "@/components/processing/processing-experience"

export const metadata: Metadata = {
  title: "Processing | PaperLens AI",
  description:
    "Live pipeline: PDF parsing, concept extraction, summaries, maps, and flashcards.",
}

function ProcessingFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
      <div
        className="size-11 animate-spin rounded-full border-2 border-accent/30 border-t-accent"
        aria-hidden
      />
      <p className="text-sm text-muted-foreground">Preparing analysis…</p>
    </div>
  )
}

export default function ProcessingPage() {
  return (
    <Suspense fallback={<ProcessingFallback />}>
      <ProcessingShell />
    </Suspense>
  )
}
