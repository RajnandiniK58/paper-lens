"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, FileText, Link2, ScrollText, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  MIN_PASTED_PLAINTEXT_CHARS,
  writePendingPlaintext,
} from "@/lib/paperlens-plaintext-session"
import { MAX_PDF_UPLOAD_BYTES } from "@/lib/paperlens-limits"
import { cn } from "@/lib/utils"
import { usePaperlensStore } from "@/stores/paperlens-store"

const maxMb = (MAX_PDF_UPLOAD_BYTES / (1024 * 1024)).toFixed(0)

export function UploadSection() {
  const router = useRouter()
  const setPendingPdf = usePaperlensStore((s) => s.setPendingPdf)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [active, setActive] = React.useState(false)
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [arxivUrl, setArxivUrl] = React.useState("")
  const [pastedText, setPastedText] = React.useState("")

  const bindPdf = React.useCallback(
    (f: File) => {
      if (f.size > MAX_PDF_UPLOAD_BYTES) {
        setUploadError(
          `This PDF is too large (max ${maxMb} MB). Try a smaller file or compress the PDF.`
        )
        setFileName(null)
        setPendingPdf(null)
        return
      }
      const okType =
        f.type === "application/pdf" ||
        f.name.toLowerCase().endsWith(".pdf")
      if (!okType) {
        setUploadError("Please upload a PDF file.")
        setFileName(null)
        setPendingPdf(null)
        return
      }
      setUploadError(null)
      setFileName(f.name)
      setPendingPdf(f)
    },
    [setPendingPdf]
  )

  const onFiles = (files: FileList | null) => {
    const f = files?.[0]
    if (f) bindPdf(f)
  }

  const startDemoProcessing = () => {
    setPendingPdf(null)
    setFileName(null)
    router.push("/processing?file=demo-paper.pdf")
  }

  const startLiveAnalysis = () => {
    const pending = usePaperlensStore.getState().pendingPdfFile
    if (!pending || !fileName) {
      setUploadError("Choose a PDF first, then start analysis.")
      return
    }
    router.push(
      `/processing?file=${encodeURIComponent(fileName)}&live=1`
    )
  }

  const startPastedTextAnalysis = () => {
    const trimmed = pastedText.trim()
    if (trimmed.length < MIN_PASTED_PLAINTEXT_CHARS) {
      setUploadError(
        `Paste at least ${MIN_PASTED_PLAINTEXT_CHARS} characters (abstract, excerpt, or notes).`
      )
      return
    }
    if (!writePendingPlaintext(trimmed)) {
      setUploadError(
        "Could not store pasted text in this browser session. Check storage permissions or try a shorter excerpt."
      )
      return
    }
    setUploadError(null)
    setPendingPdf(null)
    setFileName(null)
    router.push(
      `/processing?file=${encodeURIComponent("Pasted abstract.txt")}&live=1&source=text`
    )
  }

  return (
    <section
      id="upload"
      className="relative scroll-mt-24 px-4 py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mx-auto max-w-2xl"
      >
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Bring your source text
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg">
            PDF for full papers, paste mode for abstracts and excerpts, arXiv
            links when remote fetch ships.
          </p>
        </div>

        <Tabs
          defaultValue="pdf"
          className="w-full"
          onValueChange={() => setUploadError(null)}
        >
          <TabsList className="grid h-auto min-h-12 w-full grid-cols-3 gap-1 rounded-xl bg-secondary/50 p-1">
            <TabsTrigger
              value="pdf"
              className="gap-1.5 px-2 py-2 text-xs sm:text-sm"
            >
              <Upload className="size-4 shrink-0" />
              <span className="truncate">Upload PDF</span>
            </TabsTrigger>
            <TabsTrigger
              value="abstract"
              className="gap-1.5 px-2 py-2 text-xs sm:text-sm"
            >
              <ScrollText className="size-4 shrink-0" />
              <span className="truncate">Paste abstract</span>
            </TabsTrigger>
            <TabsTrigger
              value="arxiv"
              className="gap-1.5 px-2 py-2 text-xs sm:text-sm"
            >
              <Link2 className="size-4 shrink-0" />
              <span className="truncate">arXiv link</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="mt-6 outline-none">
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(e) => onFiles(e.target.files)}
            />

            <motion.div
              onDragEnter={(e) => {
                e.preventDefault()
                setActive(true)
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setActive(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setActive(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setActive(false)
                const f = e.dataTransfer.files?.[0]
                if (f) bindPdf(f)
              }}
              className={cn(
                "relative rounded-xl border-2 border-dashed p-10 text-center transition-all sm:p-12",
                active
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center gap-4 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <motion.span
                  animate={
                    active
                      ? { y: [0, -4, 0], scale: [1, 1.05, 1] }
                      : { y: [0, -3, 0] }
                  }
                  transition={{
                    duration: active ? 0.9 : 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex rounded-full bg-secondary p-4"
                >
                  <FileText className="size-8 text-muted-foreground" />
                </motion.span>
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Drop your PDF here
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    or click to browse from your computer (max {maxMb} MB)
                  </p>
                </div>
              </button>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => inputRef.current?.click()}
                >
                  Select File
                </Button>
                <Button type="button" onClick={startLiveAnalysis} disabled={!fileName}>
                  Start analysis
                </Button>
                <Button type="button" variant="secondary" onClick={startDemoProcessing}>
                  Try demo pipeline
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/processing?file=demo-paper.pdf">Open processing</Link>
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {fileName ? (
                  <motion.div
                    key={fileName}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mx-auto mt-4 flex w-full max-w-md flex-col items-center gap-2"
                  >
                    <div className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground">
                      <FileText className="size-4 shrink-0 text-accent" />
                      <span className="truncate">{fileName}</span>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </TabsContent>

          <TabsContent value="abstract" className="mt-6 outline-none">
            <div className="space-y-4">
              <div
                className={cn(
                  "rounded-2xl border border-border/60 bg-card/40 p-1 shadow-inner",
                  "backdrop-blur-xl ring-1 ring-white/[0.04]"
                )}
              >
                <Textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste abstract, introduction, methods excerpt, or any research passage you want structured (summaries, concepts, flashcards)…"
                  className="min-h-[220px] resize-y border-0 bg-transparent px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/80 focus-visible:ring-0 sm:min-h-[260px] sm:text-[15px]"
                  spellCheck
                  aria-label="Paste abstract or research text"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  {pastedText.trim().length} / {MIN_PASTED_PLAINTEXT_CHARS}+ characters
                  (minimum before analyze)
                </p>
                <Button
                  type="button"
                  className="gap-2 self-start sm:self-auto"
                  onClick={startPastedTextAnalysis}
                >
                  Run analysis
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="arxiv" className="mt-6 outline-none">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="https://arxiv.org/abs/…"
                  value={arxivUrl}
                  onChange={(e) => setArxivUrl(e.target.value)}
                  className="h-14 bg-secondary/30 pl-4 pr-32 text-base"
                  aria-label="arXiv paper URL"
                />
                <Button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 gap-2"
                  disabled
                  title="Remote arXiv fetch is not enabled yet"
                >
                  Analyze
                  <ArrowRight className="size-4" />
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                URL ingestion is UI-only for now. Use PDF upload or paste abstract
                for live analysis.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["arXiv.org", "abs / pdf", "Versioned IDs"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <AnimatePresence mode="wait">
          {uploadError ? (
            <motion.p
              key={uploadError}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-4 text-center text-sm text-destructive"
            >
              {uploadError}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
