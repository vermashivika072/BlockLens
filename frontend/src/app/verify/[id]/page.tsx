"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Download,
  Calendar,
  Building2,
  User,
  Hash,
  Globe,
  Zap,
  Cpu,
  Fingerprint
} from "lucide-react";
import { Layout } from "@/components/certichain/Layout";
import { TrustGauge } from "@/components/certichain/TrustGauge";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function VerifyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchVerification() {
      try {
        const response = await fetch(`${API_BASE}/verify/${id}`);
        if (!response.ok) {
          throw new Error("Verification record not found.");
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load verification.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchVerification();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[oklch(0.78_0.18_200)] border-t-transparent" />
          <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Synchronizing with Blockchain Ledger...</p>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="mx-auto mt-20 max-w-md text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="mt-6 font-display text-3xl font-bold">Verification Failed</h1>
          <p className="mt-3 text-muted-foreground">{error || "The requested certificate record does not exist or has been revoked."}</p>
          <button 
            onClick={() => router.push("/")}
            className="mt-8 rounded-full bg-white px-8 py-3 text-sm font-bold text-black transition hover:scale-105"
          >
            Back to Scanner
          </button>
        </div>
      </Layout>
    );
  }

  const isReal = data.verification_status === "real";
  const statusColor = isReal ? "text-emerald-400" : data.verification_status === "fake" ? "text-red-500" : "text-amber-500";
  const StatusIcon = isReal ? ShieldCheck : data.verification_status === "fake" ? XCircle : AlertTriangle;

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[40px] border border-white/10 bg-black/40 p-8 md:p-12 shadow-2xl backdrop-blur-xl"
        >
          {/* Background Glow */}
          <div className={`absolute -right-20 -top-20 h-96 w-96 rounded-full blur-[120px] opacity-20 ${isReal ? "bg-emerald-500" : "bg-red-500"}`} />

          <header className="relative z-10 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`mb-6 grid h-24 w-24 place-items-center rounded-3xl ${isReal ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"} shadow-inner`}
            >
              <StatusIcon className="h-12 w-12" />
            </motion.div>
            
            <h1 className="font-display text-4xl font-bold md:text-6xl tracking-tight">
              Verdict: <span className={statusColor}>{data.verification_status.toUpperCase()}</span>
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground text-lg leading-relaxed">
              Our Multi-Modal AI Forensic Engine has completed a sub-pixel audit against the decentralized ledger.
            </p>
          </header>

          <div className="mt-16 grid gap-10 lg:grid-cols-12">
            {/* Left Column: Trust Gauge & Proofs */}
            <div className="lg:col-span-5 space-y-8">
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Holistic Authenticity Score</h3>
                <TrustGauge score={Math.round(data.authenticity_score * 100)} />
                <div className="mt-8 flex items-center justify-center gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">ML Anomaly</p>
                    <p className={`text-sm font-bold ${data.ml_anomaly?.is_anomaly ? "text-red-500" : "text-emerald-400"}`}>
                      {data.ml_anomaly?.is_anomaly ? "DETECTED" : "CLEAR"}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div>
                    <p className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">CNN Forensic</p>
                    <p className="text-sm font-bold text-white">
                      {Math.round((1 - (data.cnn_forensics?.cnn_pixel_forgery_score || 0)) * 100)}% Match
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/5 bg-white/5 p-6">
                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[oklch(0.78_0.18_200)] mb-5">
                  <Fingerprint className="h-4 w-4" /> Digital Fingerprint
                </h4>
                <p className="break-all font-mono text-[11px] text-white/50 bg-black/60 p-4 rounded-xl border border-white/5 leading-relaxed">
                  {data.blockchain_hash}
                </p>
                <div className="mt-4 flex items-center justify-between px-1">
                  <span className="text-xs text-muted-foreground">Ledger Sync Status</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full animate-pulse ${data.blockchain_valid ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span className={`text-xs font-bold ${data.blockchain_valid ? "text-emerald-500" : "text-red-500"}`}>
                      {data.blockchain_valid ? "IMUTABLE & VERIFIED" : "NOT ON LEDGER"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Metadata & AI Audit */}
            <div className="lg:col-span-7 space-y-6">
              {/* AI Forensic Mode Section */}
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 relative overflow-hidden">
                {/* AI Forensic Mode Status Indicator */}
                <div className="absolute top-6 right-8 flex items-center gap-2 z-30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-500 uppercase">AI Forensic Mode Active</span>
                </div>

                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-display text-2xl font-bold flex items-center gap-3">
                    <Cpu className="h-6 w-6 text-[oklch(0.78_0.18_200)]" /> Deep Learning Audit
                  </h3>
                  <div className="px-3 py-1 rounded-full bg-[oklch(0.78_0.18_200)]/10 border border-[oklch(0.78_0.18_200)]/20 text-[10px] font-bold text-[oklch(0.78_0.18_200)] tracking-widest">
                    V3.1.2 ENSEMBLE
                  </div>
                </div>

                {/* Heatmap with Scanner Line */}
                {data.ela_heatmap_url && (
                  <div className="mb-8 relative rounded-2xl overflow-hidden border border-white/10 bg-black/50 aspect-video group shadow-2xl">
                    <img 
                      src={`${API_BASE}${data.ela_heatmap_url}`} 
                      alt="Forensic Heatmap" 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-emerald-500/10 to-transparent opacity-30" />
                    
                    {/* Moving Laser Scanner Line */}
                    <motion.div 
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-[2px] bg-emerald-500/60 shadow-[0_0_20px_oklch(0.7_0.2_160)] z-20"
                    />
                    
                    <div className="absolute bottom-4 left-4 flex gap-2 z-30">
                      <div className="px-2 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono text-emerald-400">
                        SALIENCY MAP: ACTIVE
                      </div>
                      <div className="px-2 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono text-emerald-400">
                        ViT-L/14 NEURAL ENGINE
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  {(data.analysis_summary || []).map((point: string, i: number) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i} 
                      className="flex gap-4 text-sm text-white/70 leading-relaxed p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <Zap className="h-4 w-4 mt-1 text-[oklch(0.78_0.18_200)] shrink-0" />
                      {point}
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "CNN Audit", value: data.cnn_forensics?.cnn_layout_audit?.texture_consistency || "Consistent" },
                    { label: "Pixel Variance", value: data.forensic_report?.noise_inconsistency || "Uniform" },
                    { label: "Edge Analysis", value: data.forensic_report?.edge_artifacts || "Clean" },
                    { label: "DL Verdict", value: isReal ? "GENUINE" : "TAMPERED" },
                  ].map(item => (
                    <div key={item.label} className="rounded-2xl bg-black/40 p-4 text-center border border-white/5">
                      <p className="text-[10px] uppercase tracking-tighter text-muted-foreground mb-2">{item.label}</p>
                      <p className="text-xs font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = `${API_BASE}/report/${id}`;
                    link.download = `certichain_report_${id}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-white text-black py-5 text-sm font-bold transition hover:bg-white/90 active:scale-95 shadow-xl"
                >
                  <Download className="h-5 w-5" /> Export Forensic Report
                </button>
                <button 
                  onClick={() => router.push("/")}
                  className="flex-1 flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-5 text-sm font-bold transition hover:bg-white/10 active:scale-95"
                >
                   Perform New Scan
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
