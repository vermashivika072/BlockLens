"use client";

import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export function CertificatePreview() {
  return (
    <div className="relative h-full w-full flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 rounded-full bg-[oklch(0.7_0.22_260)] opacity-20 blur-[100px] animate-pulse" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          rotateY: 0,
          y: [0, -20, 0] 
        }}
        transition={{ 
          duration: 1.5,
          y: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="relative preserve-3d"
      >
        {/* Certificate Image */}
        <div className="relative overflow-hidden rounded-2xl border border-white/20 shadow-2xl shadow-blue-500/20">
          <img 
            src="/academic_certificate_mockup_1777912686946.png" 
            alt="Certificate Mockup" 
            className="h-auto w-full max-w-lg object-cover"
          />
          
          {/* Scanning Line Animation */}
          <motion.div 
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[oklch(0.78_0.18_200)] to-transparent shadow-[0_0_15px_oklch(0.78_0.18_200)]"
          />
        </div>

        {/* Verified Badge */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="absolute -right-6 top-10 flex items-center gap-2 rounded-2xl border border-white/20 bg-background/80 px-4 py-2 shadow-xl backdrop-blur-xl"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</div>
            <div className="text-sm font-bold text-emerald-500">Verified On-Chain</div>
          </div>
        </motion.div>

        {/* Forensic Badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
          className="absolute -left-6 bottom-10 flex items-center gap-2 rounded-2xl border border-white/20 bg-background/80 px-4 py-2 shadow-xl backdrop-blur-xl"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Forensics</div>
            <div className="text-sm font-bold text-blue-500">No Tampering</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
