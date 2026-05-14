"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ActivityIcon } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export type ActivityEntry = {
  id: string
  message: string
  at: number
}

type ProcessingActivityLogProps = {
  entries: ActivityEntry[]
  className?: string
}

export function ProcessingActivityLog({
  entries,
  className,
}: ProcessingActivityLogProps) {
  const list = React.useMemo(
    () => [...entries].sort((a, b) => b.at - a.at).slice(0, 14),
    [entries]
  )

  return (
    <div
      className={cn(
        "pointer-events-none flex flex-col gap-3",
        className
      )}
    >
      <div className="pointer-events-auto flex items-center gap-2 px-1">
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/30">
          <ActivityIcon className="size-4 text-accent" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Live activity
          </p>
          <p className="text-[11px] text-muted-foreground/80">
            Streamed from analysis workers
          </p>
        </div>
      </div>

      <div className="pointer-events-auto relative max-h-[min(340px,42vh)] overflow-hidden rounded-2xl border border-border/80 bg-card/50 shadow-xl ring-1 ring-foreground/[0.06] backdrop-blur-xl sm:max-h-[min(380px,50vh)]">
        <div className="absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-card/90 to-transparent" />
        <ScrollArea className="h-[min(340px,42vh)] sm:h-[min(380px,50vh)]">
          <ul className="flex flex-col gap-2 p-3 pt-5 pb-4">
            <AnimatePresence initial={false}>
              {list.map((entry, i) => (
                <motion.li
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: 28, filter: "blur(6px)" }}
                  animate={{ opacity: 1 - i * 0.045, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 28,
                    mass: 0.6,
                  }}
                  className="relative rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-[13px] leading-snug text-foreground/95 shadow-sm ring-1 ring-foreground/[0.04] backdrop-blur-sm"
                >
                  <span className="mb-1 block font-mono text-[10px] text-muted-foreground">
                    {new Date(entry.at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  {entry.message}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </ScrollArea>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card/95 to-transparent" />
      </div>
    </div>
  )
}
