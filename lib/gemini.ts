import "server-only"

import { GoogleGenAI } from "@google/genai/node"

import { buildMockFallbackAnalysis } from "@/lib/analysis-fallback"
import type {
  PaperLensAnalysis,
  PaperLensFlashcard,
  PaperLensSummary,
} from "@/types/ai"

/** Gemini 2.5 Flash (Google AI) */
export const PAPERLENS_GEMINI_MODEL = "gemini-2.5-flash" as const

const MAX_INPUT_CHARS = 900_000

let client: GoogleGenAI | null = null

/**
 * JSON Schema passed to Gemini `responseJsonSchema` (supported subset per SDK docs).
 * Enforces the public PaperLens analysis shape.
 */
export const PAPERLENS_ANALYSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "concepts",
    "flashcards",
    "relatedTopics",
    "beginnerExplanation",
  ],
  properties: {
    summary: {
      type: "object",
      additionalProperties: false,
      required: [
        "title",
        "oneLineSummary",
        "problemSolved",
        "methodUsed",
        "difficulty",
      ],
      properties: {
        title: { type: "string", description: "Concise paper title if inferable" },
        oneLineSummary: { type: "string" },
        problemSolved: { type: "string" },
        methodUsed: { type: "string" },
        difficulty: {
          type: "string",
          description:
            "One of: beginner | intermediate | advanced | expert (or closest plain label)",
        },
      },
    },
    concepts: {
      type: "array",
      items: { type: "string" },
      description: "5–15 short concept phrases",
    },
    flashcards: {
      type: "array",
      minItems: 2,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "answer"],
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
      },
    },
    relatedTopics: {
      type: "array",
      items: { type: "string" },
      description: "3–8 related research directions or adjacent topics",
    },
    beginnerExplanation: {
      type: "string",
      description:
        "Plain-language explanation only: no markdown, no bullet syntax, single flowing paragraphs allowed separated by newlines only if essential",
    },
  },
} as const

const ANALYSIS_SYSTEM_INSTRUCTION = `You are PaperLens AI, a meticulous research assistant.
You receive raw text extracted from an academic PDF or preprint.

Rules (must follow all):
1) Output MUST be a single JSON object only. No markdown, no code fences, no commentary outside JSON.
2) All string values must be plain text: no markdown headings, lists, bold, italics, or links.
3) Base every factual claim on the supplied text. If something is unclear, write "Unclear from excerpt" for that field or phrase rather than inventing citations.
4) summary.difficulty must reflect the paper's technical depth for a newcomer (choose the closest label among: beginner, intermediate, advanced, expert).
5) concepts: short noun phrases (2–6 words), deduplicated, ordered from most central to peripheral.
6) flashcards: high-quality Q/A for active recall; answers must be self-contained and accurate to the text.
7) relatedTopics: neighboring ideas, methods, or fields — not generic advice.
8) beginnerExplanation: warm, precise, non-patronizing; define jargon inline using simple clauses; avoid markdown entirely.

Tone: confident, neutral, academic-adjacent.`

function getApiKeyFromEnv(): string | undefined {
  return (
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    undefined
  )
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = getApiKeyFromEnv()
  if (!apiKey) {
    throw new GeminiConfigurationError(
      "Missing API key: set GOOGLE_API_KEY or GEMINI_API_KEY in .env.local"
    )
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey })
  }
  return client
}

export class GeminiConfigurationError extends Error {
  readonly code = "UNAUTHORIZED" as const
  constructor(message: string) {
    super(message)
    this.name = "GeminiConfigurationError"
  }
}

export type GeminiModelFailureKind =
  | "EMPTY_INPUT"
  | "INPUT_TOO_LARGE"
  | "UPSTREAM"

export class GeminiModelError extends Error {
  readonly code = "MODEL_ERROR" as const
  constructor(
    message: string,
    readonly kind: GeminiModelFailureKind = "UPSTREAM",
    readonly cause?: unknown
  ) {
    super(message)
    this.name = "GeminiModelError"
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined
}

function asStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out: string[] = []
  for (const item of v) {
    if (typeof item === "string") out.push(item)
    else return undefined
  }
  return out
}

function asFlashcards(v: unknown): PaperLensFlashcard[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out: PaperLensFlashcard[] = []
  for (const item of v) {
    if (!isRecord(item)) return undefined
    const q = asString(item.question)
    const a = asString(item.answer)
    if (q === undefined || a === undefined) return undefined
    out.push({ question: q, answer: a })
  }
  return out
}

function asSummary(v: unknown): PaperLensSummary | undefined {
  if (!isRecord(v)) return undefined
  const title = asString(v.title)
  const oneLineSummary = asString(v.oneLineSummary)
  const problemSolved = asString(v.problemSolved)
  const methodUsed = asString(v.methodUsed)
  const difficulty = asString(v.difficulty)
  if (
    title === undefined ||
    oneLineSummary === undefined ||
    problemSolved === undefined ||
    methodUsed === undefined ||
    difficulty === undefined
  ) {
    return undefined
  }
  return {
    title,
    oneLineSummary,
    problemSolved,
    methodUsed,
    difficulty,
  }
}

export function parsePaperLensAnalysisJson(raw: string): PaperLensAnalysis {
  const trimmed = raw.trim()
  const unfenced = stripMarkdownCodeFences(trimmed)
  const jsonPayload = extractFirstJsonObject(unfenced)
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonPayload) as unknown
  } catch (e) {
    throw new JsonParseError("Invalid JSON from model", e)
  }
  if (!isRecord(parsed)) {
    throw new JsonParseError("JSON root must be an object")
  }

  const summary = asSummary(parsed.summary)
  const concepts = asStringArray(parsed.concepts)
  const flashcards = asFlashcards(parsed.flashcards)
  const relatedTopics = asStringArray(parsed.relatedTopics)
  const beginnerExplanation = asString(parsed.beginnerExplanation)

  if (
    !summary ||
    !concepts ||
    !flashcards ||
    !relatedTopics ||
    beginnerExplanation === undefined
  ) {
    throw new JsonParseError("JSON does not match PaperLens analysis schema")
  }

  return {
    summary,
    concepts,
    flashcards,
    relatedTopics,
    beginnerExplanation,
  }
}

export class JsonParseError extends Error {
  readonly code = "PARSE_ERROR" as const
  constructor(
    message: string,
    readonly cause?: unknown
  ) {
    super(message)
    this.name = "JsonParseError"
  }
}

/**
 * Removes optional ``` or ```json wrappers the model might still emit.
 */
export function stripMarkdownCodeFences(text: string): string {
  let s = text.trim()
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "")
    s = s.replace(/\s*```$/i, "")
  }
  return s.trim()
}

/**
 * If extra prose wraps JSON, take the outermost `{ ... }` block.
 */
export function extractFirstJsonObject(text: string): string {
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start === -1 || end === -1 || end <= start) {
    throw new JsonParseError("No JSON object found in model output")
  }
  return text.slice(start, end + 1)
}

export interface AnalyzePaperTextOptions {
  /** Override default model id (tests / canary) */
  model?: string
  signal?: AbortSignal
}

/**
 * Runs Gemini 2.5 Flash with JSON schema enforcement, validates output, and
 * returns a strict {@link PaperLensAnalysis} object.
 */
export async function analyzePaperText(
  text: string,
  options: AnalyzePaperTextOptions = {}
): Promise<PaperLensAnalysis> {
  const trimmed = text.trim()
  if (!trimmed) {
    throw new GeminiModelError("Input text is empty", "EMPTY_INPUT")
  }
  if (trimmed.length > MAX_INPUT_CHARS) {
    throw new GeminiModelError(
      `Input exceeds maximum length of ${MAX_INPUT_CHARS} characters`,
      "INPUT_TOO_LARGE"
    )
  }

  const ai = getGeminiClient()
  const model = options.model ?? PAPERLENS_GEMINI_MODEL

  const userPrompt = `Analyze the following research text and produce the JSON object as specified.

TEXT BEGIN
${trimmed}
TEXT END`

  let rawText: string | undefined
  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseJsonSchema: PAPERLENS_ANALYSIS_JSON_SCHEMA,
        temperature: 0.35,
        maxOutputTokens: 8192,
        abortSignal: options.signal,
      },
    })
    rawText = response.text
  } catch (e) {
    if (e instanceof GeminiConfigurationError) throw e
    throw new GeminiModelError("Gemini request failed", "UPSTREAM", e)
  }

  if (!rawText?.trim()) {
    throw new GeminiModelError("Empty response from Gemini", "UPSTREAM")
  }

  try {
    return parsePaperLensAnalysisJson(rawText)
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "[PaperLens] JSON parse failed; raw (truncated):",
        rawText.slice(0, 2000)
      )
    }
    return buildMockFallbackAnalysis(trimmed, "parse_json")
  }
}
