export const PIPELINE_STAGES = [
  { id: "parse", label: "Parsing PDF" },
  { id: "sections", label: "Extracting sections" },
  { id: "concepts", label: "Identifying concepts" },
  { id: "summary", label: "Generating summary" },
  { id: "map", label: "Building concept map" },
  { id: "cards", label: "Creating flashcards" },
] as const

export type PipelineStageId = (typeof PIPELINE_STAGES)[number]["id"]

/** Progress thresholds (0–1) at which each stage completes */
export const STAGE_PROGRESS_THRESHOLDS = [0.14, 0.3, 0.46, 0.62, 0.78, 1] as const

export const TOTAL_PIPELINE_MS = 15_200

export const INITIAL_ETA_SECONDS = 48

export const LOG_TEMPLATES: Record<
  PipelineStageId,
  readonly [string, string, string]
> = {
  parse: [
    "Decoder ring: PDF object graph traversed",
    "Embedded fonts & vector paths indexed",
    "OCR pass skipped — native text layers found",
  ],
  sections: [
    "Heuristic headings aligned to structure tree",
    "Abstract · Methods · Results boundaries scored",
    "Bibliography block isolated for reference graph",
  ],
  concepts: [
    "Entity linker: 240 candidate spans scored",
    "Domain lexicon merged with paper-specific terms",
    "Core claims vs. supporting evidence tagged",
  ],
  summary: [
    "Hierarchical condensation (section-aware)",
    "Numerical results pulled into fact table",
    "Limitations & future work surfaced",
  ],
  map: [
    "Co-occurrence graph built (weighted edges)",
    "Community detection — 6 concept clusters",
    "Layout engine: force-directed stabilization",
  ],
  cards: [
    "Q/A pairs generated with difficulty tiers",
    "Distractors synthesized from adjacent sections",
    "Spaced-repetition metadata attached",
  ],
}
