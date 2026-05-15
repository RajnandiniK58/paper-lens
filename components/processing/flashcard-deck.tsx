"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { PaperLensFlashcard } from "@/types/ai"

type FlashcardDeckProps = {
  cards: PaperLensFlashcard[]
  className?: string
}

export function FlashcardDeck({ cards, className }: FlashcardDeckProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [open, setOpen] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (open === null) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(null)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null)
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <ScrollArea className={cn("h-[min(380px,52vh)] pr-3", className)}>
      <div ref={rootRef} className="space-y-3 pb-1">
        {cards.map((fc, idx) => {
          const isOpen = open === idx
          return (
            <motion.div
              key={`${idx}-${fc.question.slice(0, 32)}`}
              layout
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className={cn(
                "relative overflow-hidden rounded-xl border bg-card/75 text-left shadow-md backdrop-blur-md transition-colors",
                isOpen
                  ? "border-accent/55 shadow-[0_0_0_1px_oklch(0.65_0.15_220_/0.22),0_20px_50px_-24px_oklch(0.65_0.15_220_/0.35)]"
                  : "border-border/70 hover:border-accent/35"
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                className="flex w-full flex-col gap-1 px-4 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {isOpen ? "Answer" : "Question"}
                </span>
                <motion.p
                  layout="position"
                  className="text-sm font-medium leading-snug text-foreground"
                >
                  {fc.question}
                </motion.p>
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    key="back"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden border-t border-border/60 bg-muted/25"
                  >
                    <div className="relative px-4 pb-4 pt-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                        aria-label="Close card"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpen(null)
                        }}
                      >
                        <XIcon className="size-4" />
                      </Button>
                      <motion.p
                        initial={{ y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.06, duration: 0.28 }}
                        className="pr-10 text-sm leading-relaxed text-muted-foreground"
                      >
                        {fc.answer}
                      </motion.p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
