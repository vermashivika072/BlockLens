"use client";

import { motion } from "framer-motion";
import { UploadCloud, Cpu, ShieldCheck, FileCheck2 } from "lucide-react";
import { Layout, PageHeader } from "@/components/certichain/Layout";

const steps = [
  {
    icon: UploadCloud,
    title: "Upload",
    desc: "Drop a PDF or image. End-to-end encrypted in flight.",
  },
  {
    icon: Cpu,
    title: "AI Scan",
    desc: "Vision model dissects every pixel, font and seal in real time.",
  },
  {
    icon: ShieldCheck,
    title: "Blockchain Verify",
    desc: "Hash is matched against on-chain notarized records.",
  },
  {
    icon: FileCheck2,
    title: "Result",
    desc: "Confidence score, audit log, downloadable proof — instantly.",
  },
];

export default function How() {
  return (
    <Layout>
      <PageHeader eyebrow="How it works" title="From upload to proof in 4 steps." />
      <section className="mx-auto mt-20 max-w-4xl px-6 pb-10">
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[oklch(0.7_0.22_260)] via-[oklch(0.65_0.25_305)] to-[oklch(0.78_0.18_200)] md:left-1/2" />
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className={`relative mb-14 flex items-center gap-6 ${i % 2 ? "md:flex-row-reverse" : ""}`}
            >
              <div className="absolute left-6 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full bg-gradient-to-br from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] glow md:left-1/2">
                <s.icon className="h-5 w-5 text-white" />
              </div>
              <div
                className={`glass ml-16 w-full rounded-2xl p-6 md:ml-0 md:w-[calc(50%-3rem)] ${i % 2 ? "md:mr-auto" : "md:ml-auto"}`}
              >
                <span className="font-mono text-xs text-[oklch(0.78_0.18_200)]">
                  STEP {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
