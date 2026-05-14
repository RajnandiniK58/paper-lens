"use client"

import { motion } from "framer-motion"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const cards = [
  { title: "Executive summary", lines: [85, 100, 72, 90] as const },
  { title: "Concept map", lines: [60, 100, 100, 55] as const },
  { title: "Flashcard deck", lines: [70, 88, 100, 40] as const },
  { title: "Key entities", lines: [92, 66, 78, 100] as const },
] as const

type ProcessingSkeletonCardsProps = {
  shimmer: number
  className?: string
}

export function ProcessingSkeletonCards({
  shimmer,
  className,
}: ProcessingSkeletonCardsProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
        className
      )}
    >
      {cards.map((c, cardIndex) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.08 * cardIndex,
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Card className="h-full border-border/80 bg-card/50 shadow-lg ring-1 ring-foreground/[0.05] backdrop-blur-sm">
            <CardHeader className="gap-2 pb-2">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-3 w-2/5" />
                <motion.span
                  className="size-2 rounded-full bg-accent/80"
                  animate={{
                    scale: [1, 1.35, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    delay: cardIndex * 0.12,
                  }}
                />
              </div>
              <p className="text-xs font-medium text-muted-foreground">{c.title}</p>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {c.lines.map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ width: 0 }}
                  animate={{ width: `${w * (0.92 + 0.06 * Math.sin(shimmer + i + cardIndex))}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 18 }}
                >
                  <Skeleton className="h-2 w-full rounded-full" />
                </motion.div>
              ))}
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 flex-1 rounded-lg" />
                <Skeleton className="size-8 shrink-0 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
