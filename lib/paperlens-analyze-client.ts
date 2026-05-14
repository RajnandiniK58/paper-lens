import { buildMockFallbackAnalysis } from "@/lib/analysis-fallback"
import type { PaperLensAnalysis } from "@/types/ai"

export class PaperlensRequestError extends Error {
  constructor(
    readonly endpoint: "parse-pdf" | "analyze",
    readonly status: number,
    readonly body: unknown
  ) {
    super(`${endpoint} failed with HTTP ${status}`)
    this.name = "PaperlensRequestError"
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function isPaperLensAnalysis(v: unknown): v is PaperLensAnalysis {
  if (!isRecord(v)) return false
  if (!isRecord(v.summary)) return false
  const s = v.summary
  if (
    typeof s.title !== "string" ||
    typeof s.oneLineSummary !== "string" ||
    typeof s.problemSolved !== "string" ||
    typeof s.methodUsed !== "string" ||
    typeof s.difficulty !== "string"
  ) {
    return false
  }
  if (!Array.isArray(v.concepts) || !v.concepts.every((c) => typeof c === "string"))
    return false
  if (!Array.isArray(v.flashcards)) return false
  for (const fc of v.flashcards) {
    if (!isRecord(fc) || typeof fc.question !== "string" || typeof fc.answer !== "string")
      return false
  }
  if (
    !Array.isArray(v.relatedTopics) ||
    !v.relatedTopics.every((c) => typeof c === "string")
  )
    return false
  return typeof v.beginnerExplanation === "string"
}

export async function parsePdfToText(
  file: File,
  signal?: AbortSignal
): Promise<{ text: string; pageCount: number }> {
  const fd = new FormData()
  fd.set("file", file, file.name)
  const res = await fetch("/api/parse-pdf", { method: "POST", body: fd, signal })
  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new PaperlensRequestError("parse-pdf", res.status, null)
  }
  if (!res.ok) {
    throw new PaperlensRequestError("parse-pdf", res.status, data)
  }
  if (!isRecord(data) || typeof data.text !== "string") {
    throw new PaperlensRequestError("parse-pdf", res.status, data)
  }
  const pageCount = typeof data.pageCount === "number" ? data.pageCount : 0
  return { text: data.text, pageCount }
}

export async function analyzeExtractedText(
  text: string,
  signal?: AbortSignal
): Promise<PaperLensAnalysis> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text } satisfies { text: string }),
    signal,
  })
  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new PaperlensRequestError("analyze", res.status, null)
  }
  if (!res.ok) {
    throw new PaperlensRequestError("analyze", res.status, data)
  }
  if (!isPaperLensAnalysis(data)) {
    return buildMockFallbackAnalysis(text.slice(0, 800), "parse_json")
  }
  return data
}

function errorMessageFromBody(body: unknown): string | null {
  if (!isRecord(body)) return null
  const err = body.error
  if (!isRecord(err)) return null
  return typeof err.message === "string" ? err.message : null
}

/**
 * End-to-end: PDF → text → `/api/analyze`. Uses mock fallback on any failure.
 */
export async function runFullPdfAnalysis(
  file: File,
  signal?: AbortSignal
): Promise<{
  analysis: PaperLensAnalysis
  usedFallback: boolean
  warning: string | null
}> {
  let text = ""
  try {
    const parsed = await parsePdfToText(file, signal)
    text = parsed.text
  } catch (e) {
    const msg =
      e instanceof PaperlensRequestError
        ? errorMessageFromBody(e.body) ?? e.message
        : null
    return {
      analysis: buildMockFallbackAnalysis("", "parse_error"),
      usedFallback: true,
      warning: msg ?? "Could not extract text from this PDF.",
    }
  }

  try {
    const analysis = await analyzeExtractedText(text, signal)
    return { analysis, usedFallback: false, warning: null }
  } catch (e) {
    const reason =
      e instanceof PaperlensRequestError && e.status >= 500
        ? "model_error"
        : "network_error"
    const msg =
      e instanceof PaperlensRequestError
        ? errorMessageFromBody(e.body) ?? e.message
        : "Analysis failed."
    return {
      analysis: buildMockFallbackAnalysis(text.slice(0, 2000), reason),
      usedFallback: true,
      warning: msg,
    }
  }
}
