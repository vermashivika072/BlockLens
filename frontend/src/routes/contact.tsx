"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { Layout, PageHeader } from "@/components/certichain/Layout";

export default function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <Layout>
      <PageHeader
        eyebrow="Contact"
        title="Let's talk."
        subtitle="Universities, employers, hackathon judges — we'd love to hear from you."
      />
      <section className="mx-auto mt-12 grid max-w-5xl gap-6 px-6 pb-20 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass space-y-6 rounded-2xl p-6"
        >
          <div>
            <Mail className="h-5 w-5 text-[oklch(0.78_0.18_200)]" />
            <h4 className="mt-3 font-display font-semibold">Email</h4>
            <p className="text-sm text-muted-foreground">hello@certichain.ai</p>
          </div>
          <div>
            <MapPin className="h-5 w-5 text-[oklch(0.65_0.25_305)]" />
            <h4 className="mt-3 font-display font-semibold">HQ</h4>
            <p className="text-sm text-muted-foreground">Bengaluru · Singapore</p>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="glass space-y-4 rounded-2xl p-6 md:col-span-2"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input
              required
              placeholder="Your name"
              className="w-full rounded-xl border border-border bg-input/40 px-4 py-3 text-sm outline-none transition focus:border-primary"
            />
            <input
              required
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-border bg-input/40 px-4 py-3 text-sm outline-none transition focus:border-primary"
            />
          </div>
          <input
            placeholder="Institution / Company"
            className="w-full rounded-xl border border-border bg-input/40 px-4 py-3 text-sm outline-none transition focus:border-primary"
          />
          <textarea
            required
            rows={5}
            placeholder="How can we help?"
            className="w-full resize-none rounded-xl border border-border bg-input/40 px-4 py-3 text-sm outline-none transition focus:border-primary"
          />
          <button
            type="submit"
            disabled={sent}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] px-6 py-3 text-sm font-semibold text-white glow transition hover:scale-[1.03] disabled:opacity-60"
          >
            {sent ? (
              "Message sent ✓"
            ) : (
              <>
                Send message <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </motion.form>
      </section>
    </Layout>
  );
}
