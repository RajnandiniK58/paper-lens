"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { FileTextIcon, UploadCloudIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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

  return (
    <section
      id="upload"
      className="scroll-mt-20 border-b border-border/60 bg-muted/20 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Drop your paper here
          </h2>
          <p className="mt-3 text-muted-foreground sm:text-lg">
            PDFs up to typical journal length. We extract structure, figures
            references, and key claims for downstream AI views.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
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
            whileHover={{ scale: 1.005 }}
            className={cn(
              "relative flex w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors",
              active
                ? "border-accent bg-accent/10"
                : "border-border bg-card/40 hover:border-accent/50 hover:bg-card/70"
            )}
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center gap-4 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                className="flex size-14 items-center justify-center rounded-2xl bg-accent/15 ring-1 ring-accent/35"
              >
                <UploadCloudIcon className="size-7 text-accent" />
              </motion.span>
              <div>
                <p className="text-base font-medium text-foreground">
                  Drag &amp; drop a PDF
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  or click to browse from your device (max {maxMb} MB)
                </p>
              </div>
            </button>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
              >
                Choose file
              </Button>
              <Button
                type="button"
                onClick={startLiveAnalysis}
                disabled={!fileName}
              >
                Start analysis
              </Button>
              <Button type="button" variant="outline" onClick={startDemoProcessing}>
                Try demo pipeline
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/processing?file=demo-paper.pdf">Open processing</Link>
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {uploadError ? (
                <motion.p
                  key={uploadError}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="max-w-md text-center text-sm text-destructive"
                >
                  {uploadError}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {fileName ? (
                <motion.div
                  key={fileName}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex w-full max-w-md flex-col items-center gap-2"
                >
                  <div className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground">
                    <FileTextIcon className="size-4 shrink-0 text-accent" />
                    <span className="truncate">{fileName}</span>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
