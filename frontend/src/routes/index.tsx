"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ShieldCheck, Cpu, Zap } from "lucide-react";
import { Layout } from "@/components/certichain/Layout";
import { Scene3D } from "@/components/certichain/Scene3D";
import { isAuthenticated } from "@/lib/auth";

const features = [
  {
    icon: ShieldCheck,
    title: "Decentralized Proof",
    desc: "Every credential is anchored to a decentralized ledger, creating a permanent, immutable record of achievement.",
  },
  {
    icon: Cpu,
    title: "Forensic AI Analysis",
    desc: "Our vision models detect microscopic inconsistencies in fonts, pixels, and metadata to expose advanced forgeries.",
  },
  {
    icon: Zap,
    title: "Verifiable Digital IDs",
    desc: "Generate secure, one-click verification links and QR codes for instant validation by employers and institutions.",
  },
];

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  return (
    <Layout>
      <div>
        <section className="relative mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-2 md:items-center md:py-20">
          <div className="hero-text">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-glow-pulse rounded-full bg-[oklch(0.78_0.18_200)]" />
              AI + Blockchain · Live
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] md:text-7xl">
              Verify academic certificates with AI.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              CertiChain combines computer vision and blockchain notarization to expose forgeries in
              milliseconds - built for universities, employers, and the future.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={isLoggedIn ? "/scan" : "/login?redirect=/scan"}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] px-6 py-3 text-sm font-semibold text-white glow transition hover:scale-[1.03]"
              >
                Get Started <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/scan"
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/5 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                Verify Now
              </Link>
            </div>
          </div>
          <div className="scene-container relative h-[420px] md:h-[560px]">
            <div className="absolute inset-0 -z-10 rounded-full bg-[oklch(0.7_0.22_260)] opacity-30 blur-[120px]" />
            <Scene3D />
          </div>
        </section>

        <section className="features-grid mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center hero-text">
            <span className="text-xs uppercase tracking-widest text-[oklch(0.78_0.18_200)]">
              Why CertiChain
            </span>
            <h2 className="mt-2 font-display text-4xl font-bold md:text-5xl">
              Built for trust at <span className="text-gradient">global scale</span>.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="feature-card border-beam glass group relative overflow-hidden rounded-3xl p-8 transition hover:-translate-y-1"
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[oklch(0.7_0.22_260)] opacity-0 blur-3xl transition group-hover:opacity-30" />
                <div className="relative z-10">
                  <div className="mb-5 inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)]">
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20">
          <div className="glass relative overflow-hidden rounded-3xl p-12 text-center">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[oklch(0.7_0.22_260)]/20 via-transparent to-[oklch(0.65_0.25_305)]/20" />
            <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-[oklch(0.78_0.18_200)] animate-float" />
            <h2 className="font-display text-3xl font-bold md:text-5xl">
              Ready to <span className="text-gradient">eliminate fraud?</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Join 180+ universities trusting CertiChain.
            </p>
            <Link
              href="/contact"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 text-sm font-semibold transition hover:scale-105"
            >
              Talk to us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
