import type { Metadata } from "next"
import { Suspense } from "react"

import { ResultsShell } from "@/components/processing/results-shell"

export const metadata: Metadata = {
  title: "Results | PaperLens AI",
  description:
    "Summaries, concept maps, and flashcards — your structured research workspace.",
}

function ResultsFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div
        className="size-10 animate-spin rounded-full border-2 border-accent/30 border-t-accent"
        aria-hidden
      />
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsFallback />}>
      <ResultsShell />
    </Suspense>
  )
}
