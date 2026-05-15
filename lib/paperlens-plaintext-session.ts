/** Minimum pasted characters before we call the analysis API. */
export const MIN_PASTED_PLAINTEXT_CHARS = 60

/** Session buffer for “paste abstract” flow (avoids huge URLs; read once on processing). */
export const PAPERLENS_PLAINTEXT_SESSION_KEY = "paperlens_pending_plaintext_v1"

export function writePendingPlaintext(text: string): boolean {
  if (typeof window === "undefined") return false
  try {
    sessionStorage.setItem(PAPERLENS_PLAINTEXT_SESSION_KEY, text)
    return true
  } catch {
    return false
  }
}

export function readAndClearPendingPlaintext(): string | null {
  if (typeof window === "undefined") return null
  try {
    const v = sessionStorage.getItem(PAPERLENS_PLAINTEXT_SESSION_KEY)
    sessionStorage.removeItem(PAPERLENS_PLAINTEXT_SESSION_KEY)
    return v
  } catch {
    return null
  }
}
