"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeftIcon, FileTextIcon } from "lucide-react"

import {
  ProcessingActivityLog,
  type ActivityEntry,
} from "@/components/processing/processing-activity-log"
import { ProcessingAiPanel } from "@/components/processing/processing-ai-panel"
import { ProcessingProgressBar } from "@/components/processing/processing-progress-bar"
import { ProcessingSkeletonCards } from "@/components/processing/processing-skeleton-cards"
import { ProcessingStageList } from "@/components/processing/processing-stage-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { buildMockFallbackAnalysis } from "@/lib/analysis-fallback"
import {
  MIN_PASTED_PLAINTEXT_CHARS,
  readAndClearPendingPlaintext,
} from "@/lib/paperlens-plaintext-session"
import { analyzeExtractedText, parsePdfToText } from "@/lib/paperlens-analyze-client"
import {
  INITIAL_ETA_SECONDS,
  LOG_TEMPLATES,
  PIPELINE_STAGES,
  STAGE_PROGRESS_THRESHOLDS,
  TOTAL_PIPELINE_MS,
  type PipelineStageId,
} from "@/lib/processing-pipeline"
import { usePaperlensStore } from "@/stores/paperlens-store"
import type { PaperLensAnalysis } from "@/types/ai"

function easeOutPow(t: number, pow = 1.65) {
  return 1 - Math.pow(1 - t, pow)
}

function stageIndexFromProgress(eased: number) {
  for (let i = 0; i < STAGE_PROGRESS_THRESHOLDS.length; i++) {
    if (eased < STAGE_PROGRESS_THRESHOLDS[i]) return i
  }
  return PIPELINE_STAGES.length
}

function pushStageLogs(
  stageId: PipelineStageId,
  setLogs: React.Dispatch<React.SetStateAction<ActivityEntry[]>>,
  getNextId: () => string
) {
  const lines = LOG_TEMPLATES[stageId]
  lines.forEach((message, i) => {
    window.setTimeout(() => {
      setLogs((prev) => [
        {
          id: getNextId(),
          message,
          at: Date.now(),
        },
        ...prev,
      ])
    }, i * 380)
  })
}

export function ProcessingShell() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const live = searchParams.get("live") === "1"
  const fileLabel = searchParams.get("file") ?? "research-paper.pdf"
  const textMode = searchParams.get("source") === "text"

  const setAnalysis = usePaperlensStore((s) => s.setAnalysis)
  const clearPendingPdf = usePaperlensStore((s) => s.clearPendingPdf)

  const [progress, setProgress] = React.useState(0)
  const [easedProgress, setEasedProgress] = React.useState(0)
  const [logs, setLogs] = React.useState<ActivityEntry[]>([])
  const [isExiting, setIsExiting] = React.useState(false)
  const [shimmer, setShimmer] = React.useState(0)
  const [livePipelineError, setLivePipelineError] = React.useState<string | null>(
    null
  )

  const startedAt = React.useRef<number | null>(null)
  const lastEmittedStage = React.useRef(-1)
  const logCounter = React.useRef(0)
  const extractedTextRef = React.useRef<string>("")

  const nextLogId = () => {
    logCounter.current += 1
    return `log-${logCounter.current}`
  }

  const activeStageIndex = stageIndexFromProgress(easedProgress)
  const allComplete = activeStageIndex >= PIPELINE_STAGES.length
  const activeLabel = allComplete
    ? "Finalizing artifacts"
    : (PIPELINE_STAGES[activeStageIndex]?.label ?? "Processing")

  const remainingSeconds = React.useMemo(() => {
    const p = progress / 100
    const raw = Math.ceil((1 - p) * INITIAL_ETA_SECONDS)
    return Math.max(0, raw)
  }, [progress])

  React.useEffect(() => {
    let frame = 0
    const loop = (now: number) => {
      setShimmer(now * 0.002)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [])

  React.useEffect(() => {
    if (live) return
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setLogs([
        {
          id: nextLogId(),
          message:
            "Job accepted — priority lane allocated on regional inference mesh.",
          at: Date.now(),
        },
        {
          id: nextLogId(),
          message: `Source artifact bound: “${fileLabel}”.`,
          at: Date.now() - 400,
        },
      ])
    })
    return () => {
      cancelled = true
    }
  }, [fileLabel, live])

  React.useEffect(() => {
    if (live) return
    let frame = 0
    let cancelled = false
    const exitScheduled = { current: false }

    const loop = (now: number) => {
      if (cancelled) return
      if (startedAt.current === null) startedAt.current = now
      const elapsed = now - startedAt.current
      const t = Math.min(1, elapsed / TOTAL_PIPELINE_MS)
      const eased = easeOutPow(t)
      setEasedProgress(eased)
      setProgress(eased * 100)

      const si = stageIndexFromProgress(eased)
      if (si > lastEmittedStage.current) {
        for (
          let k = lastEmittedStage.current + 1;
          k <= si && k < PIPELINE_STAGES.length;
          k++
        ) {
          pushStageLogs(PIPELINE_STAGES[k].id, setLogs, nextLogId)
        }
        lastEmittedStage.current = si
      }

      if (t >= 1) {
        if (!exitScheduled.current) {
          exitScheduled.current = true
          window.setTimeout(() => setIsExiting(true), 320)
        }
        return
      }

      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [live])

  React.useEffect(() => {
    if (!live) return
    const ac = new AbortController()
    let cancelled = false

    queueMicrotask(() => {
      if (cancelled) return
      startedAt.current = performance.now()
      lastEmittedStage.current = -1
      extractedTextRef.current = ""
      setLivePipelineError(null)
      setProgress(4)
      setEasedProgress(0.08)
      setLogs([
        {
          id: nextLogId(),
          message: `Live pipeline engaged for “${fileLabel}”.`,
          at: Date.now(),
        },
      ])

      const push = (message: string) => {
        logCounter.current += 1
        setLogs((prev) => [
          {
            id: `log-${logCounter.current}`,
            message,
            at: Date.now(),
          },
          ...prev,
        ])
      }

      const finish = (
        analysis: PaperLensAnalysis,
        meta: { usedFallback: boolean; warning: string | null; name: string | null }
      ) => {
        setAnalysis(analysis, {
          usedFallback: meta.usedFallback,
          warning: meta.warning,
          fileName: meta.name,
        })
        clearPendingPdf()
        setProgress(100)
        setEasedProgress(1)
        push(
          meta.usedFallback
            ? "Returned structured fallback JSON — review banner on results."
            : "Structured JSON validated — opening results workspace."
        )
        window.setTimeout(() => setIsExiting(true), 380)
      }

      ;(async () => {
        const runAnalyze = async (text: string, resultFileLabel: string) => {
          setProgress(58)
          setEasedProgress(0.68)
          push("POST /api/analyze — Gemini 2.5 Flash (JSON schema enforced).")
          const analysis = await analyzeExtractedText(text, ac.signal)
          if (cancelled) return
          pushStageLogs("summary", setLogs, nextLogId)
          window.setTimeout(() => {
            if (!cancelled) pushStageLogs("map", setLogs, nextLogId)
          }, 180)
          window.setTimeout(() => {
            if (!cancelled) pushStageLogs("cards", setLogs, nextLogId)
          }, 360)
          setProgress(92)
          setEasedProgress(0.95)
          finish(analysis, {
            usedFallback: false,
            warning: null,
            name: resultFileLabel,
          })
        }

        if (textMode) {
          const raw = readAndClearPendingPlaintext()
          const text = raw?.trim() ?? ""
          if (text.length < MIN_PASTED_PLAINTEXT_CHARS) {
            setLivePipelineError(
              `Paste at least ${MIN_PASTED_PLAINTEXT_CHARS} characters (abstract or excerpt) so the model has enough context.`
            )
            push("No pasted text found in session — return home and use “Run analysis”.")
            finish(buildMockFallbackAnalysis("", "parse_error"), {
              usedFallback: true,
              warning: "Missing or too-short pasted text.",
              name: fileLabel,
            })
            return
          }
          extractedTextRef.current = text
          try {
            push("Plain-text mode — using pasted content (skipping /api/parse-pdf).")
            setProgress(24)
            setEasedProgress(0.36)
            push(
              `Text buffer ready: ${text.length.toLocaleString()} characters (pasted).`
            )
            pushStageLogs("sections", setLogs, nextLogId)
            window.setTimeout(() => {
              if (!cancelled) pushStageLogs("concepts", setLogs, nextLogId)
            }, 220)
            setProgress(44)
            setEasedProgress(0.52)
            await runAnalyze(text, fileLabel)
          } catch (e) {
            if (cancelled) return
            const excerpt = extractedTextRef.current
            push(`Pipeline error: ${e instanceof Error ? e.message : String(e)}`)
            finish(buildMockFallbackAnalysis(excerpt.slice(0, 4000), "model_error"), {
              usedFallback: true,
              warning: "AI analysis failed for pasted text.",
              name: fileLabel,
            })
          }
          return
        }

        const file = usePaperlensStore.getState().pendingPdfFile
        if (!file) {
          setLivePipelineError(
            "No PDF found in session. Return home, select a file, and choose Start analysis."
          )
          push("Session missing PDF handle — cannot call /api/parse-pdf.")
          finish(buildMockFallbackAnalysis("", "parse_error"), {
            usedFallback: true,
            warning: "No PDF in browser session.",
            name: fileLabel,
          })
          return
        }

        try {
          push("POST /api/parse-pdf — extracting plain text (pdf-parse, server).")
          setProgress(12)
          setEasedProgress(0.16)
          const { text, pageCount } = await parsePdfToText(file, ac.signal)
          if (cancelled) return
          extractedTextRef.current = text
          push(
            `Text buffer ready: ${text.length.toLocaleString()} chars from ${pageCount || "?"} pages.`
          )
          setProgress(42)
          setEasedProgress(0.48)
          pushStageLogs("parse", setLogs, nextLogId)
          window.setTimeout(() => {
            if (!cancelled) pushStageLogs("sections", setLogs, nextLogId)
          }, 200)
          window.setTimeout(() => {
            if (!cancelled) pushStageLogs("concepts", setLogs, nextLogId)
          }, 450)

          await runAnalyze(text, file.name)
        } catch (e) {
          if (cancelled) return
          const excerpt = extractedTextRef.current
          const isAfterParse = excerpt.length > 0
          push(
            `Pipeline error: ${e instanceof Error ? e.message : String(e)}`
          )
          if (isAfterParse) {
            finish(buildMockFallbackAnalysis(excerpt.slice(0, 4000), "model_error"), {
              usedFallback: true,
              warning: "AI analysis failed after text extraction; showing fallback content.",
              name: file.name,
            })
          } else {
            finish(buildMockFallbackAnalysis("", "parse_error"), {
              usedFallback: true,
              warning: "PDF extraction or network failed before analysis.",
              name: file.name,
            })
          }
        }
      })()
    })

    return () => {
      cancelled = true
      ac.abort()
    }
  }, [live, fileLabel, textMode, setAnalysis, clearPendingPdf])

  React.useEffect(() => {
    if (!isExiting) return
    const id = window.setTimeout(() => {
      router.push("/results?from=processing")
    }, 820)
    return () => window.clearTimeout(id)
  }, [isExiting, router])

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden bg-background"
      animate={
        isExiting
          ? { opacity: 0, scale: 1.035, filter: "blur(14px)" }
          : { opacity: 1, scale: 1, filter: "blur(0px)" }
      }
      transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(0.22 0.015 260 / 0.5) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.22 0.015 260 / 0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 80% 55% at 50% -10%, black 25%, transparent 65%)",
          }}
        />
        <motion.div
          className="absolute -left-40 top-32 size-[520px] rounded-full bg-accent/18 blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-32 bottom-20 size-[440px] rounded-full bg-chart-3/22 blur-3xl"
          animate={{ scale: [1, 1.06, 1], opacity: [0.28, 0.48, 0.28] }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <header className="mb-8 flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-1.5" asChild>
              <Link href="/">
                <ArrowLeftIcon />
                Home
              </Link>
            </Button>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/35">
                <FileTextIcon className="size-4 text-accent" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {fileLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {live
                    ? "Live pipeline · pdf-parse + Gemini (server)"
                    : "Secure scan · ephemeral working set"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {live ? (
              <Badge variant="outline" className="font-mono text-xs">
                LIVE
              </Badge>
            ) : null}
            <Badge variant="outline" className="font-mono text-xs">
              ETA ~{remainingSeconds}s
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent/60 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              {allComplete ? "Finishing" : "Processing"}
            </Badge>
          </div>
        </header>

        {livePipelineError ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-foreground"
          >
            {livePipelineError}
          </motion.div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <div>
              <h1 className="text-balance text-2xl font-medium tracking-tight text-foreground sm:text-3xl lg:text-[2rem] lg:leading-tight">
                We&apos;re reading your paper like a{" "}
                <span className="bg-gradient-to-r from-foreground via-accent to-chart-2 bg-clip-text text-transparent">
                  research lab on fast-forward
                </span>
                .
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                Deterministic layout extraction runs first, then specialized
                models synthesize summaries, maps, and study aids — streamed
                here in real time.
              </p>
            </div>

            <ProcessingProgressBar value={progress} />

            <ProcessingStageList
              activeIndex={activeStageIndex}
              progress={easedProgress}
              allComplete={allComplete}
            />

            <AnimatePresence>
              {allComplete ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground"
                >
                  <span className="font-medium">Pipeline complete.</span>{" "}
                  Handoff to results workspace…
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <ProcessingAiPanel
              pulsePhase={shimmer}
              activeStageLabel={activeLabel}
            />
            <ProcessingActivityLog entries={logs} />
          </div>
        </div>

        <section className="mt-12 space-y-4 border-t border-border/60 pt-10">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-lg font-medium tracking-tight text-foreground">
              Emerging artifacts
            </h2>
            <p className="text-xs text-muted-foreground">
              Placeholders mirror final layout while models stream output.
            </p>
          </div>
          <ProcessingSkeletonCards shimmer={shimmer} />
        </section>
      </div>
    </motion.div>
  )
}
