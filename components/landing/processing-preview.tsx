"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { CheckCircle2Icon, Loader2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const steps = [
  { id: "ingest", label: "Ingest & normalize PDF" },
  { id: "structure", label: "Detect sections & references" },
  { id: "extract", label: "Extract entities & claims" },
  { id: "synthesize", label: "Synthesize views (map, cards, summary)" },
] as const

export function ProcessingPreview() {
  const [phase, setPhase] = React.useState(0)

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setPhase((p) => (p + 1) % 140)
    }, 120)
    return () => window.clearInterval(id)
  }, [])

  const progress = Math.min(100, (phase / 120) * 100)
  const activeStep = Math.min(
    steps.length - 1,
    Math.floor((progress / 100) * steps.length)
  )

  return (
    <section
      id="preview"
      className="scroll-mt-20 border-b border-border/60 bg-muted/15 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <Badge variant="outline" className="mb-4">
            Live-style preview
          </Badge>
          <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Watch the pipeline work
          </h2>
          <p className="mt-3 text-muted-foreground sm:text-lg">
            A transparent pass from raw PDF to structured artifacts — same
            stages your upload will follow.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
          className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]"
        >
          <Card className="border-border/80 bg-card/70">
            <CardHeader>
              <CardTitle>Processing stages</CardTitle>
              <CardDescription>
                Deterministic layout first, then model-assisted synthesis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Overall</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
              <ul className="space-y-2">
                {steps.map((step, i) => {
                  const done = i < activeStep
                  const current = i === activeStep
                  return (
                    <motion.li
                      key={step.id}
                      layout
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                        current
                          ? "border-accent/50 bg-accent/10 text-foreground"
                          : "border-border/70 bg-muted/30 text-muted-foreground",
                        done && "border-border/60 bg-muted/20 text-foreground"
                      )}
                    >
                      {done ? (
                        <CheckCircle2Icon className="size-4 shrink-0 text-accent" />
                      ) : current ? (
                        <Loader2Icon className="size-4 shrink-0 animate-spin text-accent" />
                      ) : (
                        <span className="size-4 shrink-0 rounded-full border border-border" />
                      )}
                      <span className="font-medium">{step.label}</span>
                    </motion.li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/70">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Artifacts preview</CardTitle>
              <CardDescription>
                Skeleton state while models stream structured output.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[min(420px,55vh)]">
                <div className="space-y-4 p-4">
                  <motion.div
                    animate={{ opacity: [0.55, 1, 0.55] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="space-y-2"
                  >
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                  </motion.div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((k) => (
                      <motion.div
                        key={k}
                        className="rounded-lg border border-border/70 bg-muted/25 p-3"
                        animate={{ y: [0, -2, 0] }}
                        transition={{
                          duration: 2.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: k * 0.12,
                        }}
                      >
                        <Skeleton className="mb-2 h-2 w-1/2" />
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="mt-1.5 h-2 w-4/5" />
                      </motion.div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-dashed border-accent/35 bg-accent/5 p-4">
                    <p className="text-xs font-medium text-accent">
                      Concept map stream
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["Methods", "Dataset", "Metric", "Limitation"].map(
                        (node, i) => (
                          <motion.span
                            key={node}
                            className="rounded-md border border-border/80 bg-background/80 px-2 py-1 text-[11px] text-muted-foreground"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 0.05 * i,
                              duration: 0.25,
                              repeat: Infinity,
                              repeatType: "reverse",
                              repeatDelay: 2.5,
                            }}
                          >
                            {node}
                          </motion.span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
