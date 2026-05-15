"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Loader2 } from "lucide-react"

const steps = [
  { label: "Parsing document", complete: true },
  { label: "Extracting concepts", complete: true },
  { label: "Generating summary", complete: true },
  { label: "Building mind map", complete: false, active: true },
  { label: "Creating flashcards", complete: false },
]

export function ProcessingPreview() {
  return (
    <section
      id="examples"
      className="scroll-mt-24 bg-secondary/20 px-4 py-24"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Example run-through
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A mock window showing how text moves through parsing, structuring,
            and artifact stages — the same stages your upload follows.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl shadow-accent/5">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/50">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-500/80" />
                <div className="size-3 rounded-full bg-yellow-500/80" />
                <div className="size-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-muted-foreground font-mono">
                  attention-is-all-you-need.pdf
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 min-h-[400px]">
              <div className="p-6 border-r border-border">
                <div className="space-y-4">
                  <div className="h-4 bg-secondary rounded w-3/4" />
                  <div className="h-4 bg-secondary rounded w-full" />
                  <div className="h-4 bg-secondary rounded w-5/6" />
                  <div className="h-4 bg-secondary rounded w-2/3" />
                  <div className="mt-8 h-32 bg-secondary/50 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      Figure 1: Transformer Architecture
                    </span>
                  </div>
                  <div className="h-4 bg-secondary rounded w-full" />
                  <div className="h-4 bg-secondary rounded w-4/5" />
                </div>
              </div>

              <div className="p-6 flex flex-col">
                <div className="text-sm font-medium mb-6">Processing Status</div>
                <div className="space-y-4 flex-1">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3"
                    >
                      {step.complete ? (
                        <CheckCircle2 className="size-5 text-green-500" />
                      ) : step.active ? (
                        <Loader2 className="size-5 text-accent animate-spin" />
                      ) : (
                        <div className="size-5 rounded-full border-2 border-muted" />
                      )}
                      <span
                        className={`text-sm ${
                          step.complete
                            ? "text-foreground"
                            : step.active
                              ? "text-accent"
                              : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Overall Progress</span>
                    <span>68%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "68%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      viewport={{ once: true }}
                      className="h-full bg-accent rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
        </motion.div>
      </div>
    </section>
  )
}
