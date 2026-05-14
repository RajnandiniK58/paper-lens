import { NextResponse } from "next/server"

import {
  analyzePaperText,
  GeminiConfigurationError,
  GeminiModelError,
} from "@/lib/gemini"
import type { AnalyzeApiErrorBody, AnalyzeRequestBody } from "@/types/ai"

export const runtime = "nodejs"
export const maxDuration = 120

const MAX_BODY_BYTES = 4_000_000

function jsonError(
  status: number,
  code: AnalyzeApiErrorBody["error"]["code"],
  message: string,
  details?: string
) {
  const body: AnalyzeApiErrorBody = {
    error: { code, message, ...(details ? { details } : {}) },
  }
  return NextResponse.json(body, { status })
}

function isAnalyzeRequestBody(v: unknown): v is AnalyzeRequestBody {
  if (typeof v !== "object" || v === null) return false
  const rec = v as Record<string, unknown>
  return typeof rec.text === "string"
}

export async function POST(request: Request) {
  let raw: unknown
  try {
    const buf = await request.arrayBuffer()
    if (buf.byteLength > MAX_BODY_BYTES) {
      return jsonError(
        413,
        "PAYLOAD_TOO_LARGE",
        `Request body exceeds ${MAX_BODY_BYTES} bytes`
      )
    }
    const textDecoder = new TextDecoder("utf-8", { fatal: false })
    raw = JSON.parse(textDecoder.decode(buf) || "{}") as unknown
  } catch {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON body")
  }

  if (!isAnalyzeRequestBody(raw)) {
    return jsonError(
      400,
      "BAD_REQUEST",
      'Body must be a JSON object with a string "text" field'
    )
  }

  const { text } = raw
  if (!text.trim()) {
    return jsonError(400, "BAD_REQUEST", "Field `text` must be a non-empty string")
  }

  try {
    const analysis = await analyzePaperText(text, { signal: request.signal })
    return NextResponse.json(analysis, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    if (err instanceof GeminiConfigurationError) {
      return jsonError(401, "UNAUTHORIZED", err.message)
    }
    if (err instanceof GeminiModelError) {
      const code: AnalyzeApiErrorBody["error"]["code"] =
        err.kind === "INPUT_TOO_LARGE"
          ? "PAYLOAD_TOO_LARGE"
          : err.kind === "EMPTY_INPUT"
            ? "BAD_REQUEST"
            : "MODEL_ERROR"
      const status =
        code === "PAYLOAD_TOO_LARGE"
          ? 413
          : code === "BAD_REQUEST"
            ? 400
            : 502
      return jsonError(
        status,
        code,
        err.message,
        process.env.NODE_ENV !== "production" && err.cause
          ? String(err.cause)
          : undefined
      )
    }
    console.error("[api/analyze]", err)
    return jsonError(
      500,
      "INTERNAL",
      "Unexpected error while analyzing text"
    )
  }
}
