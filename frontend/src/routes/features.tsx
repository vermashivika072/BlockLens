"use client";

import { motion } from "framer-motion";
import { Brain, ShieldCheck, Zap, Globe, Lock, BarChart3, Workflow, Database } from "lucide-react";
import { Layout, PageHeader } from "@/components/certichain/Layout";

const items = [
  {
    icon: ShieldCheck,
    title: "Decentralized Proof",
    desc: "Every credential is anchored to a decentralized ledger, creating a permanent, immutable record of achievement.",
  },
  {
    icon: Brain,
    title: "Forensic AI Analysis",
    desc: "Our vision models detect microscopic inconsistencies in fonts, pixels, and metadata to expose advanced forgeries.",
  },
  {
    icon: Zap,
    title: "Verifiable Digital IDs",
    desc: "Generate secure, one-click verification links and QR codes for instant validation by employers and institutions.",
  },
  {
    icon: Globe,
    title: "Global Compliance",
    desc: "ISO/IEC 27001 certified security protocols ensuring GDPR and international data privacy compliance.",
  },
  {
    icon: Lock,
    title: "Zero-knowledge Privacy",
    desc: "Verify without exposing personal student data.",
  },
  {
    icon: BarChart3,
    title: "Live Dashboards",
    desc: "Real-time analytics for fraud rates and verification volume.",
  },
  {
    icon: Workflow,
    title: "Bulk API",
    desc: "Verify thousands of certificates in a single batch call.",
  },
  { icon: Database, title: "Audit Trail", desc: "Immutable verification history for compliance." },
];

export default function Features() {
  return (
    <Layout>
      <PageHeader
        eyebrow="Features"
        title="Everything you need to trust a certificate."
        subtitle="Eight pillars powering verification at planetary scale."
      />
      <section className="mx-auto mt-16 max-w-6xl px-6 pb-10">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border-beam glass group rounded-2xl p-6 transition hover:-translate-y-1"
            >
              <div className="mb-4 inline-grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] transition group-hover:scale-110">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-display font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
