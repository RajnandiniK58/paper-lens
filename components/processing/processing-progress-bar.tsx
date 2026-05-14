"use client"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

type ProcessingProgressBarProps = {
  value: number
  className?: string
}

export function ProcessingProgressBar({
  value,
  className,
}: ProcessingProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-end justify-between gap-3 text-xs">
        <span className="font-medium uppercase tracking-wider text-muted-foreground">
          Pipeline progress
        </span>
        <span className="font-mono text-sm tabular-nums text-foreground">
          {clamped.toFixed(0)}%
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-muted ring-1 ring-border/80">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent/90 via-accent to-chart-2/90 shadow-[0_0_24px_oklch(0.65_0.15_220_/_0.35)]"
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22, mass: 0.8 }}
        />
        <motion.div
          className="absolute inset-y-0 w-24 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
          style={{ left: `${Math.max(0, clamped - 18)}%` }}
          animate={{ opacity: [0.2, 0.85, 0.2], x: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  )
}
