import type { PaperLensAnalysis } from "@/types/ai"

function truncateForSnippet(text: string, max = 280): string {
  const t = text.replace(/\s+/g, " ").trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}

export type MockFallbackReason =
  | "parse_error"
  | "model_error"
  | "network_error"
  | "parse_json"

/**
 * Deterministic placeholder analysis for client or server when Gemini / PDF
 * extraction fails. Matches {@link PaperLensAnalysis} shape (no markdown).
 */
export function buildMockFallbackAnalysis(
  excerpt: string,
  reason: MockFallbackReason = "model_error"
): PaperLensAnalysis {
  const snippet = truncateForSnippet(excerpt)
  const reasonCopy: Record<MockFallbackReason, string> = {
    parse_error:
      "We could not extract readable text from this PDF. Try another file or export text from your PDF viewer.",
    model_error:
      "The AI model did not return a usable analysis. This placeholder keeps your UI working.",
    network_error:
      "The analysis request could not complete. Check your connection and try again.",
    parse_json:
      "The model response could not be parsed; this is a safe placeholder summary.",
  }

  return {
    summary: {
      title: "Analysis unavailable",
      oneLineSummary: reasonCopy[reason],
      problemSolved:
        reason === "parse_error"
          ? "Text extraction failed — the document may be image-only or encrypted."
          : "Unclear from excerpt — retry analysis or provide a longer text extract.",
      methodUsed:
        reason === "parse_error"
          ? "No extractable text pipeline output."
          : "Unclear from excerpt — retry analysis or provide a longer text extract.",
      difficulty: "intermediate",
    },
    concepts: ["fallback_mode", "retry_recommended", "offline_placeholder"],
    flashcards: [
      {
        question: "What should you do if automated analysis fails?",
        answer:
          "Retry with a smaller PDF, confirm your API key in .env.local, and check the browser network tab for /api/parse-pdf and /api/analyze responses.",
      },
      {
        question: "What is the source excerpt (truncated)?",
        answer: snippet || "(no excerpt available)",
      },
    ],
    relatedTopics: [
      "paper structure",
      "methods section",
      "limitations",
      "related work",
    ],
    beginnerExplanation:
      "PaperLens could not finish a full AI read of your document this time. That is usually a temporary extraction or model issue—not a judgment on your research. When everything works, this space fills with a plain-language walkthrough of the paper.",
  }
}
