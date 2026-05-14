"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const nav = [
  { href: "#upload", label: "Upload" },
  { href: "#features", label: "Features" },
  { href: "#preview", label: "Preview" },
]

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-medium tracking-tight text-foreground"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent/20 ring-1 ring-accent/40">
            <span className="size-2.5 rounded-full bg-accent shadow-[0_0_12px_oklch(0.65_0.15_220_/_0.65)]" />
          </span>
          <span className="text-sm sm:text-base">PaperLens AI</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors",
                "hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="#features">Explore</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="#upload">Try it free</Link>
          </Button>
        </div>

        <Sheet>
          <div className="md:hidden">
            <SheetTrigger asChild>
              <Button variant="outline" size="icon-sm" aria-label="Open menu">
                <MenuIcon />
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="right" className="gap-0">
            <SheetHeader className="border-b border-border text-left">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 p-4">
              {nav.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.25 }}
                >
                  <Link
                    href={item.href}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <Button className="mt-4 w-full" asChild>
                <Link href="#upload">Try it free</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  )
}
