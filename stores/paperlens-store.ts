import { create } from "zustand"

import type { PaperLensAnalysis } from "@/types/ai"

export type PaperlensAnalysisMeta = {
  usedFallback: boolean
  warning: string | null
  fileName: string | null
}

type PaperlensStoreState = {
  pendingPdfFile: File | null
  pendingPdfName: string | null
  analysis: PaperLensAnalysis | null
  analysisMeta: PaperlensAnalysisMeta
  setPendingPdf: (file: File | null) => void
  setAnalysis: (
    analysis: PaperLensAnalysis,
    meta: Partial<PaperlensAnalysisMeta>
  ) => void
  clearPendingPdf: () => void
  resetAnalysis: () => void
}

const defaultMeta: PaperlensAnalysisMeta = {
  usedFallback: false,
  warning: null,
  fileName: null,
}

export const usePaperlensStore = create<PaperlensStoreState>((set) => ({
  pendingPdfFile: null,
  pendingPdfName: null,
  analysis: null,
  analysisMeta: defaultMeta,
  setPendingPdf: (file) =>
    set({
      pendingPdfFile: file,
      pendingPdfName: file?.name ?? null,
    }),
  setAnalysis: (analysis, meta) =>
    set({
      analysis,
      analysisMeta: {
        usedFallback: meta.usedFallback ?? false,
        warning: meta.warning ?? null,
        fileName: meta.fileName ?? null,
      },
    }),
  clearPendingPdf: () => set({ pendingPdfFile: null, pendingPdfName: null }),
  resetAnalysis: () =>
    set({
      analysis: null,
      analysisMeta: defaultMeta,
    }),
}))
