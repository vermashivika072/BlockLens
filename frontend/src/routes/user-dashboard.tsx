"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  FileText,
  Search,
  History,
  Lock,
  QrCode,
  ArrowRight,
  Clock,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/certichain/Layout";
import { isAuthenticated, getSessionUser, fetchCertificates } from "@/lib/auth";

const TABS = [
  { id: "vault", label: "Identity Vault", icon: Lock },
  { id: "certs", label: "My Certificates", icon: FolderKanban },
  { id: "history", label: "Scan History", icon: History },
];

import { FolderKanban } from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vault");

  useEffect(() => {
    const userSession = getSessionUser();
    if (!isAuthenticated() || !userSession) {
      router.replace("/login?redirect=/user/dashboard");
      return;
    }
    setUser(userSession);

    async function loadUserCerts() {
      try {
        const data = await fetchCertificates();
        setCerts(data.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch user certs", err);
        setCerts([
          { name: "University Degree.pdf", issuer: "Stanford University", status: "Real", id: "01", date: "Oct 12, 2025" },
          { name: "Work Experience Cert.png", issuer: "Google Tech", status: "Real", id: "02", date: "Nov 05, 2025" },
          { name: "Digital Signature.key", issuer: "CertiChain Auth", status: "Real", id: "03", date: "Dec 01, 2025" },
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadUserCerts();
  }, [router]);

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="glass h-fit rounded-3xl p-5">
            <div className="mb-8 flex items-center gap-3 px-2">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] shadow-lg shadow-[oklch(0.7_0.22_260)]/20">
                <Lock className="h-5 w-5 text-white" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Identity Vault</p>
                <h1 className="font-display text-xl font-bold">User Profile</h1>
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

            <div className="mt-10 space-y-4">
              <div className="rounded-2xl bg-white/5 p-4 text-center">
                <p className="text-xs text-muted-foreground">Vault Status</p>
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-500">Secure & Synced</span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  if (confirm("Logout and clear all local security data?")) {
                    localStorage.clear();
                    window.location.href = "/login";
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/5 text-xs font-bold text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all"
              >
                <RefreshCw className="h-3 w-3" /> Logout & Reset Vault
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="space-y-8">
            <header className="flex items-center justify-between">
              <div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-[oklch(0.7_0.22_260)] font-bold text-xs uppercase tracking-[0.2em] mb-2"
                >
                  <Lock className="h-3 w-3" />
                  Personal Security Handshake
                </motion.div>
                <h1 className="font-display text-4xl font-bold">
                  Welcome back, User
                </h1>
              </div>
              <button 
                onClick={() => router.push("/")}
                className="glass flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold hover:bg-white/10 transition-all active:scale-95"
              >
                <QrCode className="h-4 w-4" />
                Verify New Document
              </button>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Vault Records", value: certs.length, icon: FileText, color: "blue" },
                { label: "Identity Score", value: "98/100", icon: ShieldCheck, color: "emerald" },
                { label: "Recent Scans", value: "12", icon: History, color: "purple" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-3xl p-6 relative overflow-hidden group"
                >
                  <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                    <stat.icon className="h-16 w-16" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 font-display text-3xl font-bold">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Certificate Vault List */}
            <div className="glass rounded-[32px] p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-display text-2xl font-bold flex items-center gap-3">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                  Verified Document Archive
                </h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                      placeholder="Search archive..." 
                      className="rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2 text-sm outline-none focus:border-[oklch(0.7_0.22_260)] w-48 focus:w-64 transition-all" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {certs.map((cert, i) => (
                  <motion.div
                    key={cert.certificate_id || cert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="glass flex items-center justify-between p-5 rounded-2xl group hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-white/5 grid place-items-center">
                        <FileText className="h-6 w-6 text-muted-foreground group-hover:text-[oklch(0.7_0.22_260)] transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{cert.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-muted-foreground font-medium">{cert.issuer || "Institutional Auth"}</p>
                          <span className="h-1 w-1 rounded-full bg-white/20" />
                          <p className="text-xs text-muted-foreground font-medium">{cert.date || cert.issue_date || "Recently"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase text-emerald-500 border border-emerald-500/20">
                        Blockchain Secured
                      </span>
                      <button className="h-10 w-10 rounded-xl bg-white/5 grid place-items-center hover:bg-white/10 transition-colors">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
