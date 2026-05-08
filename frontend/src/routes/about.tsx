"use client";

import { motion } from "framer-motion";
import { Layout, PageHeader } from "@/components/certichain/Layout";

const team = [
  { name: "Shivika Verma", role: "Founder & CEO", color: "oklch(0.7 0.22 260)" },
  { name: "Saumya Agrawal", role: "Co-Founder", color: "oklch(0.65 0.25 305)" },
];

export default function About() {
  return (
    <Layout>
      <PageHeader
        eyebrow="About"
        title="The trust layer for credentials."
        subtitle="We believe a degree should mean something — verifiably, forever."
      />
      <section className="mx-auto mt-16 grid max-w-5xl gap-10 px-6 pb-10 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8"
        >
          <h3 className="font-display text-2xl font-semibold">Our mission</h3>
          <p className="mt-3 text-muted-foreground">
            Eliminate credential fraud globally by combining cutting-edge AI with the immutability
            of blockchain. Trust shouldn&apos;t take weeks of paperwork.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8"
        >
          <h3 className="font-display text-2xl font-semibold">Our story</h3>
          <p className="mt-3 text-muted-foreground">
            Founded in 2024 by a group of engineers and educators tired of seeing forged diplomas
            slip through. Today, 180+ institutions trust us.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-6 pb-10">
        <h2 className="mb-8 text-center font-display text-3xl font-bold">The team</h2>
        <div className="mx-auto grid max-w-2xl gap-5 sm:grid-cols-2 md:grid-cols-2">
          {team.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-5 text-center"
            >
              <div
                className="mx-auto h-20 w-20 rounded-full glow"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${m.color}, oklch(0.2 0.04 270))`,
                }}
              />
              <h4 className="mt-4 font-display font-semibold">{m.name}</h4>
              <p className="text-xs text-muted-foreground">{m.role}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
