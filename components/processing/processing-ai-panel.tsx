"use client"

import { motion } from "framer-motion"
import { CpuIcon, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const nodes = [
  { x: 50, y: 18, label: "PDF" },
  { x: 18, y: 62, label: "NLP" },
  { x: 82, y: 58, label: "Graph" },
  { x: 50, y: 88, label: "Out" },
] as const

const edges = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
] as const

type ProcessingAiPanelProps = {
  pulsePhase: number
  activeStageLabel: string
  className?: string
}

export function ProcessingAiPanel({
  pulsePhase,
  activeStageLabel,
  className,
}: ProcessingAiPanelProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/80 bg-card/55 shadow-2xl ring-1 ring-accent/15 backdrop-blur-md",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-chart-3/25 blur-3xl" />

      <CardHeader className="relative z-10 flex flex-row items-start justify-between gap-3 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent/15 ring-1 ring-accent/35">
              <CpuIcon className="size-4 text-accent" />
            </span>
            <CardTitle className="text-base">Inference mesh</CardTitle>
          </div>
          <p className="pl-[2.75rem] text-xs text-muted-foreground">
            Multi-agent orchestration · token stream visualization
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0 gap-1">
          <Sparkles className="size-3 text-accent" />
          Active
        </Badge>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4 pt-2">
        <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/25 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Current operator</span>
          <span className="max-w-[60%] truncate font-medium text-foreground">
            {activeStageLabel}
          </span>
        </div>

        <div className="relative aspect-[5/4] w-full overflow-hidden rounded-xl border border-border/60 bg-gradient-to-b from-muted/40 to-background/80">
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 size-full"
            aria-hidden
          >
            <defs>
              <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="oklch(0.65 0.15 220 / 0.15)" />
                <stop offset="50%" stopColor="oklch(0.65 0.15 220 / 0.55)" />
                <stop offset="100%" stopColor="oklch(0.65 0.15 220 / 0.15)" />
              </linearGradient>
            </defs>
            {edges.map(([from, to], i) => {
              const a = nodes[from]
              const b = nodes[to]
              return (
                <motion.line
                  key={`${from}-${to}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="url(#edgeGrad)"
                  strokeWidth={0.9}
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity:
                      0.28 +
                      (Math.sin(pulsePhase + i * 0.7) * 0.5 + 0.5) * 0.42,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                />
              )
            })}
            {nodes.map((n, i) => (
              <motion.g key={n.label}>
                <motion.circle
                  cx={n.x}
                  cy={n.y}
                  r={5.5}
                  className="fill-card stroke-accent"
                  strokeWidth={1.2}
                  animate={{
                    scale: [1, 1.08 + (i % 2) * 0.04, 1],
                    opacity: [0.85, 1, 0.85],
                  }}
                  transition={{
                    duration: 2.2 + i * 0.15,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.12,
                  }}
                />
                <text
                  x={n.x}
                  y={n.y - 10}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[5.5px] font-medium uppercase tracking-tight"
                >
                  {n.label}
                </text>
              </motion.g>
            ))}
          </svg>

          <motion.div
            className="absolute inset-[18%] rounded-full bg-accent/5 blur-2xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3">
            <div className="flex max-w-[90%] flex-wrap justify-center gap-1.5">
              {["tokens", "latent", "graph", "cards"].map((chip, i) => (
                <motion.span
                  key={chip}
                  className="rounded-full border border-border/80 bg-background/70 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground"
                  animate={{ y: [0, -2, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                >
                  {chip}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
