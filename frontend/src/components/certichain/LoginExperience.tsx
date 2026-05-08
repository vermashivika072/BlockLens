"use client";

import { FormEvent, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { LockKeyhole, ShieldCheck, Github, Mail, Fingerprint, Eye, EyeOff, AlertCircle, RefreshCw, Linkedin, UserCog, User } from "lucide-react";
import { createSession, clearVault } from "@/lib/auth";
import { Robot3D } from "./Robot3D";
import Link from "next/link";

const sequence = ["Authenticating Identity...", "Hashing Credentials...", "Access Granted"];

interface LoginExperienceProps {
  isAdmin?: boolean;
}

export function LoginExperience({ isAdmin = false }: LoginExperienceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const redirectTo = isAdmin ? "/dashboard" : "/user/dashboard";

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // Validate password
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    const hasMixedChars = /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
    if (!hasMixedChars) {
      setError("Password must contain a mix of uppercase, lowercase, numbers, and special characters.");
      return;
    }

    setAuthenticating(true);

    try {
      // Step 1: Request OTP
      await createSession(email, password); // Still call this to check credentials if using mock, or use new requestOtp
      // For demo, we just transition to OTP after a short delay
      window.setTimeout(() => {
        setAuthenticating(false);
        setOtpSent(true);
      }, 1500);
    } catch (err) {
      setAuthenticating(false);
      const message = err instanceof Error ? err.message : null;
      setError(message || "Login failed. Please check your credentials.");
    }
  }

  async function handleOtpSubmit(e: FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setVerifyingOtp(true);
    setError(null);

    try {
      // In production, call verifyOtp(email, code)
      // For demo, we'll simulate verification
      const timers = [0, 900, 1800].map((delay, index) =>
        window.setTimeout(() => setStep(index), delay),
      );
      
      window.setTimeout(() => {
        timers.forEach(window.clearTimeout);
        router.push(redirectTo);
      }, 2800);
    } catch (err) {
      setVerifyingOtp(false);
      setError("Invalid OTP code. Please try again.");
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-6 pt-20 md:pt-0 flex items-center justify-center">
      {/* Global Theme Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 grid-bg opacity-40" />
      <div className="pointer-events-none fixed -top-40 -right-40 -z-10 h-[600px] w-[600px] rounded-full bg-[oklch(0.65_0.25_305)] opacity-20 blur-[140px]" />
      <div className="pointer-events-none fixed -bottom-40 -left-40 -z-10 h-[600px] w-[600px] rounded-full bg-[oklch(0.78_0.18_200)] opacity-20 blur-[140px]" />

      {/* Interactive Cursor Glow */}
      <motion.div
        style={{ x: springX, y: springY }}
        className="pointer-events-none fixed left-0 top-0 -ml-[300px] -mt-[300px] h-[600px] w-[600px] rounded-full bg-[oklch(0.7_0.22_260)]/10 blur-[120px] z-0"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        {/* Left: 3D Animated Full Body Robot */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative hidden h-[600px] w-full lg:block"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Robot3D />
          </div>
        </motion.div>

        {/* Right: Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass rounded-[2.5rem] p-1 shadow-2xl relative z-10"
        >
          <div className="rounded-[2.4rem] bg-[#0d1117]/80 p-8 md:p-10 backdrop-blur-3xl">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-10 text-center"
            >
              <div className={`mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${isAdmin ? 'from-amber-500 to-orange-600 shadow-amber-500/20' : 'from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] shadow-[oklch(0.7_0.22_260)]/20'} shadow-xl`}>
                {isAdmin ? <UserCog className="h-8 w-8 text-white" /> : <Fingerprint className="h-8 w-8 text-white" />}
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight">{isAdmin ? "Admin Terminal" : "Identity Vault"}</h1>
              <p className="mt-2 text-sm text-muted-foreground font-medium uppercase tracking-[0.2em]">{isAdmin ? "Secure Authority Access" : "Secure Node Access"}</p>
            </motion.div>

            {!otpSent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, x: -20 }}
                      animate={{ opacity: 1, height: "auto", x: [0, -5, 5, -5, 5, 0] }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-semibold text-red-400"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[oklch(0.7_0.22_260)] transition-colors" />
                    <input
                      required
                      suppressHydrationWarning
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={isAdmin ? "Admin Identifier" : "Organization Email"}
                      className="w-full rounded-2xl border border-white/5 bg-white/5 pl-12 pr-4 py-4 text-sm outline-none transition focus:border-[oklch(0.7_0.22_260)]/50 focus:bg-white/10"
                    />
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <div className="relative group">
                    <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[oklch(0.7_0.22_260)] transition-colors" />
                    <input
                      required
                      suppressHydrationWarning
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Master Password"
                      className="w-full rounded-2xl border border-white/5 bg-white/5 pl-12 pr-12 py-4 text-sm outline-none transition focus:border-[oklch(0.7_0.22_260)]/50 focus:bg-white/10"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Password Instructions */}
                  <div className="mt-2 px-1 space-y-1">
                    <p className={`text-[10px] font-medium flex items-center gap-1.5 tracking-wider uppercase transition-colors ${password.length >= 8 ? "text-emerald-400" : "text-muted-foreground/80"}`}>
                      <span className={`h-1 w-1 rounded-full transition-colors ${password.length >= 8 ? "bg-emerald-400" : "bg-[oklch(0.78_0.18_200)]"}`} />
                      Min 8 characters required
                    </p>
                    <p className={`text-[10px] font-medium flex items-center gap-1.5 tracking-wider transition-colors ${(/[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) ? "text-emerald-400" : "text-muted-foreground/80"}`}>
                      <span className={`h-1 w-1 rounded-full transition-colors ${(/[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) ? "bg-emerald-400" : "bg-[oklch(0.78_0.18_200)]"}`} />
                      MIX OF A-Z, a-z, 0-9 & SPECIAL (@#$* ETC.)
                    </p>
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`relative w-full overflow-hidden rounded-2xl bg-gradient-to-r ${isAdmin ? 'from-amber-500 to-orange-600 shadow-amber-500/20 hover:shadow-amber-500/40' : 'from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] shadow-[oklch(0.7_0.22_260)]/20 hover:shadow-[oklch(0.7_0.22_260)]/40'} px-6 py-4 text-sm font-bold text-white shadow-xl transition-all`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isAdmin ? "Authorize Admin Access" : "Begin Authentication"} <LockKeyhole className="h-4 w-4" />
                  </span>
                </motion.button>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0d1117] px-2 text-muted-foreground font-bold tracking-widest">Or Continue With</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setEmail("linkedin-user@example.com");
                      setPassword("LinkedInPass123!");
                      setAuthenticating(true);
                      setTimeout(() => {
                        setAuthenticating(false);
                        setOtpSent(true);
                      }, 1500);
                    }}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold transition hover:bg-white/10"
                  >
                    <Linkedin className="h-4 w-4 text-[#0077b5]" /> LinkedIn
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEmail("google-user@example.com");
                      setPassword("GooglePass123!");
                      setAuthenticating(true);
                      setTimeout(() => {
                        setAuthenticating(false);
                        setOtpSent(true);
                      }, 1500);
                    }}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold transition hover:bg-white/10"
                  >
                    <Mail className="h-4 w-4 text-[#ea4335]" /> Google
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-8">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">A 6-digit verification code has been sent to</p>
                  <p className="text-sm font-bold text-foreground mt-1">{email}</p>
                </div>

                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputs.current[index] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-10 h-14 md:w-12 md:h-16 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl focus:border-[oklch(0.7_0.22_260)] focus:bg-white/10 outline-none transition-all"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-xs font-semibold text-red-400"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`relative w-full overflow-hidden rounded-2xl bg-gradient-to-r ${isAdmin ? 'from-amber-500 to-orange-600 shadow-amber-500/20' : 'from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] shadow-[oklch(0.7_0.22_260)]/20'} px-6 py-4 text-sm font-bold text-white shadow-xl transition-all`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Verify & Access <ShieldCheck className="h-4 w-4" />
                  </span>
                </motion.button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp(["", "", "", "", "", ""]);
                    }}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 flex flex-col items-center gap-4">
              <Link 
                href={isAdmin ? "/login" : "/admin/login"}
                className="flex items-center gap-2 text-xs font-bold text-[oklch(0.7_0.22_260)] hover:underline transition-all"
              >
                {isAdmin ? (
                  <>
                    <User className="h-3 w-3" /> Switch to User Login
                  </>
                ) : (
                  <>
                    <UserCog className="h-3 w-3" /> Switch to Admin Login
                  </>
                )}
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (confirm("This will clear your local master password. Proceed?")) {
                    clearVault();
                    window.location.reload();
                  }
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition hover:text-[oklch(0.7_0.22_260)]"
              >
                <RefreshCw className="h-3 w-3" /> Reset Identity Vault
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {authenticating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-[#02040a]/95 backdrop-blur-2xl"
          >
            <div className="relative grid h-80 w-80 place-items-center">
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-transparent border-t-[oklch(0.78_0.18_200)] border-r-[oklch(0.65_0.25_305)] opacity-50"
              />
              <motion.div
                animate={{ rotate: -360, scale: [1, 0.9, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-10 rounded-full border border-transparent border-b-[oklch(0.7_0.22_260)] border-l-[oklch(0.78_0.18_200)] opacity-50"
              />
              <motion.div
                animate={{ y: [-100, 100, -100] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-[2px] w-64 bg-gradient-to-r from-transparent via-[oklch(0.78_0.18_200)] to-transparent shadow-[0_0_40px_oklch(0.78_0.18_200)]"
              />
              <div className="text-center z-10">
                <div className="mb-4 flex justify-center">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                    <ShieldCheck className="h-10 w-10 text-[oklch(0.78_0.18_200)]" />
                  </motion.div>
                </div>
                <p className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-[oklch(0.78_0.18_200)]">
                  {verifyingOtp ? "Validating OTP..." : sequence[step]}
                </p>
                <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                  {verifyingOtp ? "Finalizing Security Handshake" : "Establishing Neural Link · Node Active"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

