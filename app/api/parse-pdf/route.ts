import { Buffer } from "node:buffer"

import { PDFParse } from "pdf-parse"
import { NextResponse } from "next/server"

import { MAX_PDF_UPLOAD_BYTES } from "@/lib/paperlens-limits"

export const runtime = "nodejs"
export const maxDuration = 60

/** Cap extracted text returned to client (analyze route has its own cap) */
const MAX_EXTRACTED_CHARS = 900_000

type ParsePdfSuccess = {
  text: string
  pageCount: number
}

type ParsePdfErrorBody = {
  error: {
    code: "BAD_REQUEST" | "PAYLOAD_TOO_LARGE" | "PARSE_ERROR" | "INTERNAL"
    message: string
  }
}

function jsonError(
  status: number,
  code: ParsePdfErrorBody["error"]["code"],
  message: string
) {
  const body: ParsePdfErrorBody = { error: { code, message } }
  return NextResponse.json(body, { status })
}

export async function POST(request: Request) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return jsonError(400, "BAD_REQUEST", "Expected multipart/form-data body")
  }

  const entry = formData.get("file")
  if (!(entry instanceof File)) {
    return jsonError(
      400,
      "BAD_REQUEST",
      'Missing file field "file" (must be a PDF File)'
    )
  }

  if (entry.size === 0) {
    return jsonError(400, "BAD_REQUEST", "Empty file upload")
  }

  if (entry.size > MAX_PDF_UPLOAD_BYTES) {
    return jsonError(
      413,
      "PAYLOAD_TOO_LARGE",
      `PDF exceeds maximum size of ${MAX_PDF_UPLOAD_BYTES} bytes`
    )
  }

  const mime = entry.type || "application/octet-stream"
  if (
    mime !== "application/pdf" &&
    !entry.name.toLowerCase().endsWith(".pdf")
  ) {
    return jsonError(400, "BAD_REQUEST", "Only PDF files are supported")
  }

  let buffer: Buffer
  try {
    buffer = Buffer.from(await entry.arrayBuffer())
  } catch {
    return jsonError(400, "BAD_REQUEST", "Could not read uploaded file")
  }

  let text = ""
  let pageCount = 0

  try {
    const parser = new PDFParse({ data: new Uint8Array(buffer) })
    try {
      const textResult = await parser.getText()
      text = textResult.text ?? ""
      pageCount = textResult.total ?? textResult.pages?.length ?? 0
    } finally {
      await parser.destroy().catch(() => undefined)
    }
  } catch (e) {
    console.error("[api/parse-pdf]", e)
    return jsonError(
      422,
      "PARSE_ERROR",
      "Failed to parse PDF — file may be corrupted, encrypted, or image-only"
    )
  }

  const normalized = text.replace(/\u0000/g, "").trim()
  if (!normalized) {
    return jsonError(
      422,
      "PARSE_ERROR",
      "No extractable text found in this PDF"
    )
  }

  const clipped =
    normalized.length > MAX_EXTRACTED_CHARS
      ? normalized.slice(0, MAX_EXTRACTED_CHARS)
      : normalized

  const payload: ParsePdfSuccess = {
    text: clipped,
    pageCount,
  }

  return NextResponse.json(payload, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  })
}
