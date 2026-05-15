"use client"

import { motion } from "framer-motion"
import {
  FileText,
  Lightbulb,
  GitBranch,
  Layers,
  BookOpen,
} from "lucide-react"

const features = [
  {
    icon: FileText,
    title: "AI Summary",
    description:
      "Get concise, intelligent summaries that capture the key findings and methodology of any paper.",
  },
  {
    icon: Lightbulb,
    title: "Concept Extraction",
    description:
      "Automatically identify and explain key concepts, terms, and definitions from the research.",
  },
  {
    icon: GitBranch,
    title: "Mind Maps",
    description:
      "Visualize the paper's structure and relationships between ideas with interactive mind maps.",
  },
  {
    icon: Layers,
    title: "Flashcards",
    description:
      "Generate study flashcards to help you memorize and review important concepts.",
  },
  {
    icon: BookOpen,
    title: "Related Topics",
    description:
      "Discover related research areas and papers to expand your understanding of the field.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export function FeaturesSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24 px-4 py-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Everything you need to understand research
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful AI tools designed to make complex research accessible to
            everyone.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-accent/50 transition-colors duration-300"
            >
              <div className="flex flex-col gap-4">
                <div className="p-3 w-fit rounded-xl bg-secondary group-hover:bg-accent/10 transition-colors">
                  <feature.icon className="size-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
