"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowRightIcon,
  BookOpenIcon,
  GitBranchIcon,
  LayersIcon,
  LightbulbIcon,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FlashcardDeck } from "@/components/processing/flashcard-deck"
import { usePaperlensStore } from "@/stores/paperlens-store"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function ResultsShell() {
  const searchParams = useSearchParams()
  const fromProcessing = searchParams.get("from") === "processing"

  const analysis = usePaperlensStore((s) => s.analysis)
  const meta = usePaperlensStore((s) => s.analysisMeta)

  const hasLiveData = analysis !== null

  return (
    <motion.main
      className="relative min-h-screen overflow-hidden bg-background"
      initial={
        fromProcessing
          ? { opacity: 0, scale: 0.97, filter: "blur(10px)" }
          : { opacity: 0, y: 12 }
      }
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 size-[480px] rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -right-20 bottom-0 size-[400px] rounded-full bg-chart-2/18 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          <motion.div variants={item} className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="gap-1.5">
              <Sparkles className="size-3 text-accent" />
              {hasLiveData ? "Analysis ready" : "Results workspace"}
            </Badge>
            {meta.usedFallback ? (
              <Badge variant="outline" className="text-xs">
                Fallback data
              </Badge>
            ) : null}
            {hasLiveData && meta.fileName ? (
              <span className="truncate text-xs text-muted-foreground sm:text-sm">
                {meta.fileName}
              </span>
            ) : null}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </motion.div>

          {meta.warning ? (
            <motion.div
              variants={item}
              className="rounded-xl border border-chart-4/40 bg-muted/40 px-4 py-3 text-sm text-foreground"
            >
              {meta.warning}
            </motion.div>
          ) : null}

          <motion.div variants={item} className="max-w-3xl space-y-4">
            <h1 className="text-balance text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              {hasLiveData ? (
                <>
                  <span className="block text-2xl sm:text-3xl">
                    {analysis.summary.title}
                  </span>
                  <span className="mt-2 block bg-gradient-to-r from-foreground via-accent to-chart-2 bg-clip-text text-transparent">
                    {analysis.summary.oneLineSummary}
                  </span>
                </>
              ) : (
                <>
                  Your paper is{" "}
                  <span className="bg-gradient-to-r from-foreground via-accent to-chart-2 bg-clip-text text-transparent">
                    structured, summarized, and study-ready
                  </span>
                  .
                </>
              )}
            </h1>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {hasLiveData
                ? "Below is the latest structured output from PaperLens. Difficulty reflects overall technical depth for a newcomer."
                : "Run a live PDF analysis from the home page to populate this workspace, or use the timed demo on the processing screen."}
            </p>
            {hasLiveData ? (
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs capitalize">
                  Difficulty: {analysis.summary.difficulty}
                </Badge>
              </div>
            ) : null}
          </motion.div>

          <motion.div
            variants={item}
            className="grid gap-4 pt-2 md:grid-cols-3"
          >
            <Card className="border-border/80 bg-card/70 shadow-xl ring-1 ring-foreground/[0.05] backdrop-blur-sm md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="size-4 text-accent" />
                  <CardTitle>Executive summary</CardTitle>
                </div>
                <CardDescription>
                  {hasLiveData
                    ? "Problem, method, and headline takeaways (plain text)."
                    : "Section-aware condensation with inline citations to the PDF."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {hasLiveData ? (
                  <>
                    <p>
                      <span className="font-medium text-foreground">Problem: </span>
                      {analysis.summary.problemSolved}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Method: </span>
                      {analysis.summary.methodUsed}
                    </p>
                    <p className="text-foreground/90">{analysis.beginnerExplanation}</p>
                  </>
                ) : (
                  <>
                    <p>
                      Replace this block with streamed markdown from your model.
                      Keep paragraph rhythm wide for readability on large displays.
                    </p>
                    <p>
                      Suggested next step: bind selection highlights to PDF viewer
                      coordinates for bidirectional navigation.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/70 shadow-lg ring-1 ring-foreground/[0.05] backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GitBranchIcon className="size-4 text-accent" />
                  <CardTitle>Concepts</CardTitle>
                </div>
                <CardDescription>
                  {hasLiveData
                    ? "Extracted entities and recurring themes."
                    : "Interactive graph canvas mounts here."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasLiveData ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.concepts.map((c) => (
                      <span
                        key={c}
                        className="rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground/90"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/25 p-4 text-center text-xs text-muted-foreground">
                    Drop in <span className="font-mono">ReactFlow</span> or your
                    graph engine. Preserve the soft border and muted fill for
                    continuity with processing skeletons.
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item} className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/80 bg-card/70 shadow-lg ring-1 ring-foreground/[0.05] backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LayersIcon className="size-4 text-accent" />
                  <CardTitle>Flashcards</CardTitle>
                </div>
                <CardDescription>
                  {hasLiveData
                    ? "Active recall pairs generated from your text."
                    : "Spaced repetition metadata attached."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasLiveData ? (
                  <FlashcardDeck cards={analysis.flashcards} />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {["Front / back pairs", "Difficulty tiers", "Distractor pool"].map(
                      (t) => (
                        <span
                          key={t}
                          className="rounded-lg border border-border/70 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground/90"
                        >
                          {t}
                        </span>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/70 shadow-lg ring-1 ring-foreground/[0.05] backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LightbulbIcon className="size-4 text-accent" />
                  <CardTitle>Key insights &amp; next topics</CardTitle>
                </div>
                <CardDescription>
                  {hasLiveData
                    ? "Angles worth exploring after this paper."
                    : "Run analysis to see related directions."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {hasLiveData ? (
                  <>
                    <ul className="list-inside list-disc space-y-1.5">
                      <li>
                        <span className="font-medium text-foreground">Problem: </span>
                        {analysis.summary.problemSolved}
                      </li>
                      <li>
                        <span className="font-medium text-foreground">Method: </span>
                        {analysis.summary.methodUsed}
                      </li>
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      {analysis.relatedTopics.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs text-foreground/90"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p>
                    Related topics and structured insights appear here after a
                    successful Gemini run.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item} className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/#upload">
                New upload
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/processing">Replay demo processing</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.main>
  )
}
