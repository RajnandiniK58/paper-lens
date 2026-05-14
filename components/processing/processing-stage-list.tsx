"use client"

import { motion } from "framer-motion"
import { CheckCircle2Icon, Loader2Icon } from "lucide-react"

import { PIPELINE_STAGES } from "@/lib/processing-pipeline"
import { cn } from "@/lib/utils"

type ProcessingStageListProps = {
  activeIndex: number
  /** 0–1 overall progress (reserved for future micro-interactions) */
  progress: number
  allComplete: boolean
  className?: string
}

export function ProcessingStageList({
  activeIndex,
  progress: _progress,
  allComplete,
  className,
}: ProcessingStageListProps) {
  return (
    <ol className={cn("space-y-2", className)}>
      {PIPELINE_STAGES.map((stage, i) => {
        const done = allComplete || i < activeIndex
        const current = !allComplete && i === activeIndex
        const upcoming = !allComplete && i > activeIndex

        return (
          <motion.li
            key={stage.id}
            layout
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative flex items-center gap-3 rounded-xl border px-3 py-3 sm:px-4 sm:py-3.5",
              done &&
                "border-border/60 bg-muted/20 text-foreground/90 shadow-sm",
              current &&
                "border-accent/45 bg-accent/[0.08] shadow-[0_0_0_1px_oklch(0.65_0.15_220_/_0.12)]",
              upcoming &&
                "border-border/40 bg-card/30 text-muted-foreground"
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/80">
              {done ? (
                <CheckCircle2Icon className="size-4 text-accent" />
              ) : current ? (
                <Loader2Icon className="size-4 animate-spin text-accent" />
              ) : (
                <span className="size-2 rounded-full bg-border" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-medium tracking-tight",
                  upcoming && "text-muted-foreground"
                )}
              >
                {stage.label}
              </p>
              {current ? (
                <motion.div
                  className="mt-2.5 h-0.5 overflow-hidden rounded-full bg-muted"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent"
                    animate={{ x: ["-30%", "220%"] }}
                    transition={{
                      duration: 1.35,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              ) : null}
            </div>
          </motion.li>
        )
      })}
    </ol>
  )
}
