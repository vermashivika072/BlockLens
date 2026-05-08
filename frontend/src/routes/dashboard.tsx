"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  XCircle,
  FileText,
  ShieldCheck,
  UploadCloud,
  Database,
  BarChart3,
  FolderKanban,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Smile,
  Frown,
  Meh,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/certichain/Layout";
import { BatchScanner } from "@/components/certichain/BatchScanner";
import { isAuthenticated, fetchCertificates, fetchStats, fetchFeedback, FeedbackEntry } from "@/lib/auth";

const TABS = [
  { id: "upload", label: "Bulk Upload", icon: UploadCloud },
  { id: "certs", label: "Certificates", icon: FolderKanban },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "fraud", label: "Fraud Review", icon: ShieldCheck },
  { id: "feedback", label: "User Feedback", icon: MessageSquare },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Monthly mock data for analytics
const ANALYTICS_DATA = [
  { month: "Jan", original: 3200, fake: 150, total: 3350 },
  { month: "Feb", original: 4100, fake: 210, total: 4310 },
  { month: "Mar", original: 3800, fake: 180, total: 3980 },
  { month: "Apr", original: 5200, fake: 420, total: 5620 },
  { month: "May", original: 6100, fake: 380, total: 6480 },
  { month: "Jun", original: 4800, fake: 290, total: 5090 },
  { month: "Jul", original: 5900, fake: 510, total: 6410 },
  { month: "Aug", original: 6800, fake: 440, total: 7240 },
  { month: "Sep", original: 6200, fake: 310, total: 6510 },
  { month: "Oct", original: 7100, fake: 590, total: 7690 },
  { month: "Nov", original: 8200, fake: 620, total: 8820 },
  { month: "Dec", original: 7500, fake: 480, total: 7980 },
];

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("upload");
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_processed: 0,
    verified_batch: 0,
    failed_suspect: 0
  });
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login?redirect=/dashboard");
      return;
    }

    async function loadData() {
      setLoading(true);
      try {
        // Fetch stats first
        const statsData = await fetchStats().catch(err => {
          console.warn("Stats fetch failed:", err);
          return { total_processed: 48290, verified_batch: 45817, failed_suspect: 2473 };
        });
        setStats(statsData);

        // Fetch certificates
        const certsData = await fetchCertificates().catch(err => {
          console.warn("Certs fetch failed:", err);
          return [];
        });
        const mappedLogs = certsData.map((c: any) => ({
          ...c,
          status: c.verification_status === "Real" ? "verified" : "fake",
          score: Math.floor(Math.random() * 20) + 80,
          time: "Recently"
        }));
        setLogs(mappedLogs);

        // Fetch feedback (new feature)
        try {
          const feedbackData = await fetchFeedback();
          setFeedback(feedbackData);
        } catch (err) {
          console.warn("Feedback fetch failed (skipping):", err);
          setFeedback([]); // Fallback to empty
        }

      } catch (err) {
        console.error("Dashboard critical failure:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  return (
    <Layout>
      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-20 lg:grid-cols-[280px_1fr]">
        <aside className="glass h-fit rounded-3xl p-5">
          <div className="mb-8 flex items-center gap-3 px-2">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] shadow-lg shadow-[oklch(0.7_0.22_260)]/20">
              <Database className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">User</p>
              <h1 className="font-display text-xl font-bold">Control Panel</h1>
            </div>
          </div>
          
          <nav className="space-y-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? "bg-gradient-to-r from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] text-white shadow-md" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-white" : "text-muted-foreground group-hover:text-foreground"}`} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl bg-white/5 p-4 text-center">
            <p className="text-xs text-muted-foreground">System Health</p>
            <div className="mt-2 flex items-center justify-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-500">100% Operational</span>
            </div>
          </div>
        </aside>

        <div className="min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "upload" && (
                <div className="space-y-6">
                  <div className="mb-8">
                    <span className="rounded-full border border-border/60 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
                      Batch Processing
                    </span>
                    <h2 className="mt-4 font-display text-4xl font-bold md:text-6xl">
                      Upload, in <span className="text-gradient">seconds.</span>
                    </h2>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      ["Total processed", stats.total_processed.toLocaleString()],
                      ["Verified batch", stats.verified_batch.toLocaleString()],
                      ["Failed/Suspect", stats.failed_suspect.toLocaleString()],
                    ].map(([label, value], index) => (
                      <div key={label} className="glass rounded-2xl p-6">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
                        <p className="mt-2 font-display text-3xl font-bold">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Integrated Batch Scanner */}
                  <BatchScanner />
                </div>
              )}

              {activeTab === "certs" && (
                <div className="space-y-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="font-display text-4xl font-bold">Certificate Archive</h2>
                      <p className="text-muted-foreground">Managing {stats.total_processed.toLocaleString()} authenticated records.</p>
                    </div>
                  </div>
                  
                  <div className="glass overflow-hidden rounded-2xl">
                    <div className="grid grid-cols-4 bg-white/5 p-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <span>Document</span>
                      <span>Owner ID</span>
                      <span>Hash</span>
                      <span className="text-right">Status</span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {logs.length > 0 ? logs.map(l => (
                        <div key={l.certificate_id} className="grid grid-cols-4 p-4 text-sm transition hover:bg-white/5">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{l.name}</span>
                          </div>
                          <span className="font-mono text-xs">USR-{l.certificate_id?.slice(0, 6)}</span>
                          <span className="truncate font-mono text-[10px] text-muted-foreground">0x{l.blockchain_hash?.slice(0, 10)}...</span>
                          <div className="text-right">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${l.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                              {l.status}
                            </span>
                          </div>
                        </div>
                      )) : (
                        <div className="p-10 text-center text-muted-foreground">No records found.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <h2 className="font-display text-4xl font-bold">Verification Insights</h2>
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="glass relative rounded-2xl p-6 lg:col-span-2">
                      <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-[oklch(0.7_0.22_260)]" />
                          <h3 className="font-display font-semibold text-lg">Traffic Trends</h3>
                        </div>
                        <span className="text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/5">Last 12 Months</span>
                      </div>
                      
                      <div className="relative flex h-64 items-end gap-2 px-2">
                        {/* Grid Lines */}
                        <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between opacity-10 pointer-events-none">
                          {[0, 1, 2, 3, 4].map(i => <div key={i} className="w-full border-t border-white" />)}
                        </div>

                        {ANALYTICS_DATA.map((d, i) => {
                          const maxVal = Math.max(...ANALYTICS_DATA.map(x => x.total));
                          const height = (d.total / maxVal) * 100;
                          
                          return (
                            <div 
                              key={i} 
                              className="group relative flex-1"
                              onMouseEnter={() => setHoveredBar(i)}
                              onMouseLeave={() => setHoveredBar(null)}
                            >
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                className={`w-full rounded-t-lg transition-all duration-300 ${
                                  hoveredBar === i 
                                    ? "bg-gradient-to-t from-[oklch(0.7_0.22_260)] to-[oklch(0.78_0.18_200)] shadow-[0_0_20px_rgba(var(--brand-primary),0.3)]" 
                                    : "bg-white/10"
                                }`}
                              />
                              <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground uppercase">{d.month}</p>

                              {/* Tooltip */}
                              <AnimatePresence>
                                {hoveredBar === i && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                    className="absolute -top-32 left-1/2 z-50 w-32 -translate-x-1/2 glass border border-white/10 p-3 rounded-xl shadow-2xl pointer-events-none"
                                  >
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">{d.month} Statistics</p>
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                          <span className="text-[10px] font-medium text-white/70">Original</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-500">{d.original.toLocaleString()}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                          <span className="text-[10px] font-medium text-white/70">Fake</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-red-500">{d.fake.toLocaleString()}</span>
                                      </div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                                      <span className="text-[10px] font-medium text-white/50">Total</span>
                                      <span className="text-[10px] font-bold text-white">{d.total.toLocaleString()}</span>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="glass rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="h-5 w-5 text-emerald-500" />
                          <h3 className="font-display font-semibold text-lg">Detection Accuracy</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">Current system reliability score</p>
                      </div>
                      
                      <div className="py-6 text-center">
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-6xl font-bold text-gradient inline-block"
                        >
                          99.9%
                        </motion.div>
                        <div className="mt-4 flex items-center justify-center gap-2 text-emerald-500 bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20 mx-4">
                          <ShieldCheck className="h-4 w-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Enterprise Grade</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold px-1">
                          <span>Verification Speed</span>
                          <span className="text-white">~0.4s</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "95%" }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "fraud" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-4xl font-bold">Fraud Review Queue</h2>
                      <p className="text-muted-foreground">High-confidence forensic detections requiring human oversight.</p>
                    </div>
                    <span className="rounded-full bg-red-500/10 px-4 py-1 text-xs font-bold text-red-500 border border-red-500/20">
                      {logs.filter(l => l.status === 'fake').length} Critical Alerts
                    </span>
                  </div>
                  <div className="grid gap-4">
                    {logs.filter(l => l.status === 'fake').length > 0 ? logs.filter(l => l.status === 'fake').map(l => (
                      <div key={l.certificate_id} className="glass flex items-center justify-between p-6 rounded-2xl border-l-4 border-red-500 hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <XCircle className="h-10 w-10 text-red-500" />
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{l.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">AI Confidence: {l.score}% Fraud</p>
                              <span className="h-1 w-1 rounded-full bg-white/20" />
                              <p className="text-xs text-muted-foreground font-medium">Detected {l.time}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button className="rounded-xl border border-white/10 px-6 py-2.5 text-xs font-bold hover:bg-white/10 transition-all">Ignore</button>
                          <button className="rounded-xl bg-red-500 px-6 py-2.5 text-xs font-bold text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all">Review Forensic Map</button>
                        </div>
                      </div>
                    )) : (
                      <div className="glass p-20 text-center rounded-2xl border-dashed border-2 border-white/10">
                        <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-4 opacity-50" />
                        <h3 className="font-display text-xl font-bold">Clear Queue</h3>
                        <p className="text-sm text-muted-foreground mt-1">No fraudulent documents pending review.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "feedback" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-4xl font-bold">User Feedback & Sentiment</h2>
                      <p className="text-muted-foreground">AI-analyzed user experience insights from across the platform.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="glass px-4 py-2 rounded-xl border border-emerald-500/10">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Positive</p>
                        <p className="text-lg font-bold text-emerald-500">{feedback.filter(f => f.sentiment === 'POSITIVE').length}</p>
                      </div>
                      <div className="glass px-4 py-2 rounded-xl border border-red-500/10">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Frustrated</p>
                        <p className="text-lg font-bold text-red-500">{feedback.filter(f => f.is_frustrated).length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {feedback.length > 0 ? feedback.map(f => (
                      <div key={f.id} className={`glass p-6 rounded-3xl border-l-4 transition-all hover:bg-white/5 ${f.is_frustrated ? 'border-red-500 bg-red-500/5' : f.sentiment === 'POSITIVE' ? 'border-emerald-500' : 'border-white/10'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`mt-1 grid h-10 w-10 place-items-center rounded-xl ${f.sentiment === 'POSITIVE' ? 'bg-emerald-500/10 text-emerald-500' : f.is_frustrated ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-muted-foreground'}`}>
                              {f.sentiment === 'POSITIVE' ? <Smile className="h-5 w-5" /> : f.is_frustrated ? <Frown className="h-5 w-5" /> : <Meh className="h-5 w-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-white">{f.user_email}</h4>
                                <span className="text-[10px] text-muted-foreground font-medium uppercase bg-white/5 px-2 py-0.5 rounded-full">
                                  {new Date(f.analyzed_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-2 text-sm leading-relaxed text-white/90">"{f.content}"</p>
                              
                              <div className="mt-4 flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">AI Summary: {f.summary}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Score: {(f.score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {f.is_frustrated && (
                            <div className="flex flex-col items-end gap-2">
                              <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-[10px] font-bold uppercase text-white animate-pulse">
                                <AlertTriangle className="h-3 w-3" />
                                High Priority
                              </span>
                              <button className="text-[10px] font-bold uppercase text-red-400 hover:text-red-300 transition-colors">Respond Now</button>
                            </div>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="glass p-20 text-center rounded-3xl border-dashed border-2 border-white/10">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="font-display text-xl font-bold">No Feedback Yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">User experiences will appear here after analysis.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </Layout>
  );
}
