import Link from "next/link"

const cols = [
  {
    title: "Product",
    links: [
      { href: "#upload", label: "Upload" },
      { href: "#features", label: "Features" },
      { href: "#preview", label: "Pipeline" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "#", label: "Privacy" },
      { href: "#", label: "Terms" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:flex-row sm:justify-between sm:px-6">
        <div className="max-w-sm space-y-3">
          <div className="flex items-center gap-2 font-medium tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent/15 ring-1 ring-accent/35">
              <span className="size-2 rounded-full bg-accent" />
            </span>
            PaperLens AI
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Understand research papers visually — summaries, maps, flashcards,
            and explanations grounded in your PDFs.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:gap-16">
          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-foreground/90 transition-colors hover:text-accent"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-border/60 px-4 pt-8 text-center text-xs text-muted-foreground sm:px-6 sm:text-left">
        © {new Date().getFullYear()} PaperLens AI. All rights reserved.
      </div>
    </footer>
  )
}
