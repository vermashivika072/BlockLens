import Link from "next/link";
import { Github, Twitter, Linkedin, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border/50 px-6 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <ShieldCheck className="h-5 w-5 text-[oklch(0.78_0.18_200)]" />
            <span className="text-gradient">CertiChain</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            AI + Blockchain certificate authenticity, in seconds.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/features">Features</Link>
            </li>
            <li>
              <Link href="/how-it-works">How it Works</Link>
            </li>
            <li>
              <Link href="/dashboard">Dashboard</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Connect</h4>
          <div className="flex gap-4 text-muted-foreground">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-all hover:text-[oklch(0.78_0.18_200)] hover:scale-110 active:scale-95"
            >
              <Github className="h-5 w-5" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-all hover:text-[oklch(0.78_0.18_200)] hover:scale-110 active:scale-95"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-all hover:text-[oklch(0.78_0.18_200)] hover:scale-110 active:scale-95"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-muted-foreground">
        © 2026 CertiChain. All rights reserved.
      </p>
    </footer>
  );
}
