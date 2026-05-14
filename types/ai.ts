/**
 * PaperLens analysis contract returned by Gemini (strict JSON, no markdown).
 */

export type PaperLensDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert"
  | string

export interface PaperLensSummary {
  title: string
  oneLineSummary: string
  problemSolved: string
  methodUsed: string
  /** Overall paper difficulty assessment */
  difficulty: PaperLensDifficulty
}

export interface PaperLensFlashcard {
  question: string
  answer: string
}

export interface PaperLensAnalysis {
  summary: PaperLensSummary
  /** Core concepts or entities (short phrases) */
  concepts: string[]
  flashcards: PaperLensFlashcard[]
  /** Adjacent areas a reader might explore next */
  relatedTopics: string[]
  /** Plain-language walkthrough for newcomers */
  beginnerExplanation: string
}

export interface AnalyzeRequestBody {
  text: string
}

export type AnalyzeApiSuccess = PaperLensAnalysis

export type AnalyzeApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "PAYLOAD_TOO_LARGE"
  | "MODEL_ERROR"
  | "PARSE_ERROR"
  | "INTERNAL"

export interface AnalyzeApiErrorBody {
  error: {
    code: AnalyzeApiErrorCode
    message: string
    /** Present in non-production or when safe to expose */
    details?: string
  }
}
