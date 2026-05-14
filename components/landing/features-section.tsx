"use client"

import { motion } from "framer-motion"
import {
  BookOpenIcon,
  BrainCircuit,
  GitBranchIcon,
  LayersIcon,
  MessageCircleIcon,
  Waypoints,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    title: "Executive summary",
    description:
      "Dense sections distilled into scannable takeaways with citations back to the PDF.",
    icon: BookOpenIcon,
  },
  {
    title: "Concept map",
    description:
      "Entities and relationships surfaced as a navigable graph so you see how ideas connect.",
    icon: GitBranchIcon,
  },
  {
    title: "Flashcards & quizzes",
    description:
      "Auto-generated cards and checks for retention — tuned for beginners, still precise.",
    icon: LayersIcon,
  },
  {
    title: "Plain-language lens",
    description:
      "Jargon unpacked on demand without flattening nuance or skipping caveats.",
    icon: MessageCircleIcon,
  },
  {
    title: "Method & results trace",
    description:
      "Follow claims to evidence: models, datasets, metrics, and limitations in one view.",
    icon: Waypoints,
  },
  {
    title: "Reasoning-aware layout",
    description:
      "Structure-first parsing preserves sections, figures, and references for faithful UI.",
    icon: BrainCircuit,
  },
]

const list = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
}

const cardMotion = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="scroll-mt-20 border-b border-border/60 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Built for how researchers actually read
          </h2>
          <p className="mt-3 text-muted-foreground sm:text-lg">
            Every output is anchored in your document so you can trust the
            thread from paragraph to visualization.
          </p>
        </motion.div>

        <motion.ul
          variants={list}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <motion.li key={f.title} variants={cardMotion} className="h-full">
              <Card className="h-full border-border/80 bg-card/60 transition-colors hover:border-accent/40 hover:bg-card/90">
                <CardHeader className="gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent/15 ring-1 ring-accent/30">
                    <f.icon className="size-5 text-accent" />
                  </span>
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {f.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                </CardContent>
              </Card>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
