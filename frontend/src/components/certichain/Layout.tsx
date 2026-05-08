import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { GlowCursor } from "./Cursor";
import { ChatbotFab } from "./Chatbot";
import { motion } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10 grid-bg opacity-40" />
      <div className="pointer-events-none fixed -top-40 -right-40 -z-10 h-[600px] w-[600px] rounded-full bg-[oklch(0.65_0.25_305)] opacity-20 blur-[140px]" />
      <div className="pointer-events-none fixed -bottom-40 -left-40 -z-10 h-[600px] w-[600px] rounded-full bg-[oklch(0.78_0.18_200)] opacity-20 blur-[140px]" />
      <GlowCursor />
      <Nav />
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-28"
      >
        {children}
      </motion.main>
      <Footer />
      <ChatbotFab />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-4xl px-6 text-center">
      {eyebrow && (
        <span className="inline-block rounded-full border border-border/60 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </span>
      )}
      <h1 className="mt-4 font-display text-4xl font-bold leading-tight md:text-6xl">
        <span className="text-gradient">{title}</span>
      </h1>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
