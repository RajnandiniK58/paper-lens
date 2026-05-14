"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRightIcon, SparklesIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          aria-hidden
          className="absolute -left-32 top-24 size-[420px] rounded-full bg-accent/25 blur-3xl"
          animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -right-24 top-40 size-[380px] rounded-full bg-chart-3/30 blur-3xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.42, 0.25] }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(0.22 0.015 260 / 0.45) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.22 0.015 260 / 0.45) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16 lg:py-28">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          <motion.div variants={item}>
            <Badge variant="secondary" className="gap-1.5 pr-2.5">
              <SparklesIcon className="size-3 text-accent" />
              Visual understanding for dense papers
            </Badge>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-balance text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]"
          >
            Turn PDFs into{" "}
            <span className="bg-gradient-to-r from-foreground via-accent to-chart-2 bg-clip-text text-transparent">
              summaries, maps, and flashcards
            </span>{" "}
            you can actually use.
          </motion.h1>

          <motion.p
            variants={item}
            className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Upload a paper and instantly get AI-powered summaries, concept maps,
            flashcards, and beginner-friendly explanations — structured for how
            you learn.
          </motion.p>

          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-3"
          >
            <Button size="lg" className="gap-1.5" asChild>
              <Link href="#upload">
                Upload a paper
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#preview">See the pipeline</Link>
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            className="flex flex-wrap gap-6 pt-2 text-xs text-muted-foreground sm:text-sm"
          >
            {["PDF parsing", "Concept graph", "Study mode"].map((label, i) => (
              <motion.span
                key={label}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.08, duration: 0.35 }}
              >
                <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_oklch(0.65_0.15_220_/_0.55)]" />
                {label}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28, rotateX: 6 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
          style={{ perspective: 1200 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-accent/25 via-transparent to-chart-3/20 blur-2xl" />
            <Card className="relative border-border/80 bg-card/90 shadow-2xl ring-1 ring-border/80 backdrop-blur-sm">
              <CardContent className="gap-6 pt-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-destructive/80" />
                    <span className="size-2.5 rounded-full bg-chart-4/90" />
                    <span className="size-2.5 rounded-full bg-accent" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    paper_preview.pdf
                  </span>
                </div>
                <div className="space-y-3 rounded-lg border border-border/80 bg-muted/30 p-4">
                  {[72, 56, 64, 48].map((w, idx) => (
                    <motion.div
                      key={idx}
                      className="h-2 rounded-full bg-foreground/10"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: `${w}%`, opacity: 1 }}
                      transition={{
                        delay: 0.35 + idx * 0.12,
                        duration: 0.55,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {["Summary", "Concept map", "Flashcards", "Glossary"].map(
                    (t, i) => (
                      <motion.div
                        key={t}
                        className="rounded-lg border border-border/70 bg-background/60 px-3 py-2 text-xs font-medium text-foreground"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.55 + i * 0.06, duration: 0.35 }}
                      >
                        {t}
                      </motion.div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
