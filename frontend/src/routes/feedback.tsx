"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Loader2, MessageSquare, Smile, Frown, Meh } from "lucide-react";
import { useState } from "react";
import { Layout, PageHeader } from "@/components/certichain/Layout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function Feedback() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: "",
    content: ""
  });

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/feedback/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: formData.email,
          content: formData.content
        })
      });

      const data = await response.json();
      if (response.ok) {
        setAnalysisResult(data.analysis);
        setSent(true);
      } else {
        alert("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Feedback error:", error);
      alert("Something went wrong. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <PageHeader
        eyebrow="AI-Powered Feedback"
        title="Help us evolve."
        subtitle="Our AI analyzes your experience in real-time to prioritize platform improvements."
      />
      <section className="mx-auto mt-12 max-w-4xl px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass relative overflow-hidden rounded-[32px] p-1 shadow-2xl"
        >
          <div className="rounded-[31px] bg-background/40 p-8 md:p-12">
            {sent && analysisResult ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-10 lg:grid-cols-[1fr_320px]"
              >
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                    Aura AI Submission Successful
                  </div>
                  <h3 className="font-display text-4xl font-bold leading-tight md:text-5xl">
                    Thank you for your <span className="text-gradient">contribution.</span>
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Your feedback has been processed. Aura has identified the core sentiments and shared them with our engineering team.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                      onClick={() => setSent(false)}
                      className="rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition hover:scale-105 active:scale-95"
                    >
                      Send Another Feedback
                    </button>
                    <Link 
                      href="/features"
                      className="rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                    >
                      View System Updates
                    </Link>
                  </div>
                </div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glass relative overflow-hidden rounded-3xl p-6 border-white/10 bg-gradient-to-br from-white/5 to-transparent shadow-2xl"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <MessageSquare className="h-20 w-20" />
                  </div>
                  
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">AI Sentiment Card</p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/70">Detected Sentiment</span>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                          analysisResult.sentiment === 'POSITIVE' ? 'bg-emerald-500/20 text-emerald-500' : 
                          analysisResult.is_frustrated ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                        }`}>
                          {analysisResult.sentiment}
                        </span>
                        {analysisResult.sentiment === 'POSITIVE' ? <Smile className="h-4 w-4 text-emerald-500" /> : 
                         analysisResult.is_frustrated ? <Frown className="h-4 w-4 text-red-500" /> : 
                         <Meh className="h-4 w-4 text-blue-400" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white/70">Aura Score</span>
                        <span className="text-sm font-bold text-white">{Math.round(analysisResult.score * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${analysisResult.score * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full ${
                            analysisResult.sentiment === 'POSITIVE' ? 'bg-emerald-500' : 
                            analysisResult.is_frustrated ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Aura Interpretation</p>
                      <p className="text-xs italic text-white/80 leading-relaxed">
                        "{analysisResult.summary}"
                      </p>
                    </div>

                    {analysisResult.is_frustrated && (
                      <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 border border-red-500/20">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase text-red-400">High Priority Flagged</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
            <form onSubmit={handleFeedback} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm outline-none transition focus:border-[oklch(0.7_0.22_260)] focus:bg-white/10"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Your Experience</label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="What can we do better?"
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm outline-none transition focus:border-[oklch(0.7_0.22_260)] focus:bg-white/10"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] py-5 text-sm font-bold text-white shadow-xl shadow-[oklch(0.7_0.22_260)]/20 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Submit to Aura AI <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}
          </div>
        </motion.div>
      </section>
    </Layout>
  );
}
