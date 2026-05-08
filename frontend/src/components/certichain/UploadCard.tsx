import { motion } from "framer-motion";
import { useState } from "react";
import { UploadCloud, FileCheck2, Cpu, ShieldCheck, Sparkles } from "lucide-react";

export function UploadCard() {
  const [stage, setStage] = useState<"idle" | "scanning" | "blockchain" | "done">("idle");
  const [drag, setDrag] = useState(false);

  const start = () => {
    setStage("scanning");
    setTimeout(() => setStage("blockchain"), 1800);
    setTimeout(() => setStage("done"), 3400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="glass relative overflow-hidden rounded-3xl p-8"
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          start();
        }}
        onClick={start}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition ${
          drag
            ? "border-[oklch(0.78_0.18_200)] bg-white/5"
            : "border-border/60 hover:border-primary/50"
        }`}
      >
        {stage === "scanning" && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[oklch(0.78_0.18_200)] to-transparent animate-scan shadow-[0_0_30px_oklch(0.78_0.18_200)]" />
          </div>
        )}
        <div className="relative mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] glow">
          {stage === "idle" && <UploadCloud className="h-7 w-7 text-white" />}
          {stage === "scanning" && <Cpu className="h-7 w-7 animate-spin text-white" />}
          {stage === "blockchain" && (
            <ShieldCheck className="h-7 w-7 animate-glow-pulse text-white" />
          )}
          {stage === "done" && <FileCheck2 className="h-7 w-7 text-white" />}
        </div>
        <h3 className="font-display text-xl font-semibold">
          {stage === "idle" && "Drop certificate here"}
          {stage === "scanning" && "AI scanning document..."}
          {stage === "blockchain" && "Verifying on blockchain..."}
          {stage === "done" && "Certificate verified ✓"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {stage === "idle" ? "PDF, PNG or JPG · max 10MB" : "Hang tight, magic happening"}
        </p>
        {stage === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-[oklch(0.78_0.18_200)]/40 bg-[oklch(0.78_0.18_200)]/10 px-4 py-2 text-sm"
          >
            <Sparkles className="h-4 w-4 text-[oklch(0.78_0.18_200)]" />
            <span>
              Authenticity confidence:{" "}
              <strong className="text-[oklch(0.78_0.18_200)]">98.7%</strong>
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
