import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Moon, Sun, ShieldCheck } from "lucide-react";
import { isAuthenticated, logout } from "@/lib/auth";

const links = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/scan", label: "Scan" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/feedback", label: "Feedback" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [light, setLight] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
  }, [light]);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] glow">
            <ShieldCheck className="h-4 w-4 text-white" />
          </span>
          <span className="text-gradient">CertiChain</span>
        </Link>
        <div className="hidden gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-white/10 text-foreground"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {!authed ? (
            <Link
              href="/login"
              className="rounded-full border border-border/60 px-4 py-1.5 text-sm font-medium transition hover:bg-white/5"
            >
              Login
            </Link>
          ) : (
            <>
              <button
                onClick={() => {
                  logout();
                  setAuthed(false);
                  router.push("/login");
                }}
                className="flex items-center gap-2 rounded-full border border-border/60 px-4 py-1.5 text-sm font-medium transition hover:bg-white/10 hover:text-red-400"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
          <button
            onClick={() => setLight((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 transition hover:bg-white/5"
            aria-label="Toggle theme"
          >
            {light ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </nav>
    </header>
  );
}
