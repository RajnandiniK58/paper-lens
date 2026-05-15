"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Microscope } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 h-[560px] w-[780px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute left-1/3 top-1/3 h-[380px] w-[380px] rounded-full bg-accent/[0.06] blur-[90px]" />
        <div
          className="absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage:
              "linear-gradient(to right, oklch(0.22 0.015 260 / 0.35) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.22 0.015 260 / 0.35) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 75% 55% at 50% 0%, black 15%, transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
          <Microscope className="size-4 text-accent" />
          Structured reading workspace
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="max-w-4xl text-balance text-center text-4xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
      >
        Read papers with{" "}
        <span className="text-accent">structure-first</span> AI
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16 }}
        className="mt-6 max-w-2xl text-pretty text-center text-lg leading-relaxed text-muted-foreground md:text-xl"
      >
        Upload a PDF or paste an abstract. PaperLens extracts text, then runs a
        single structured pass so summaries, concept lists, and flashcards stay
        grounded in what you actually provided.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.24 }}
        className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <Button size="lg" className="h-12 gap-2 px-8 text-base group" asChild>
          <Link href="#upload">
            Open workspace
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
          <Link href="#examples">See pipeline</Link>
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.36 }}
        className="mt-12 max-w-xl text-center text-xs leading-relaxed text-muted-foreground/90 sm:text-sm"
      >
        No accounts required for local analysis. Your PDF stays in the browser
        until you start a run; only extracted text is sent to the model.
      </motion.p>
    </section>
  )
}
