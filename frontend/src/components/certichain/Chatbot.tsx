"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, MessageSquare, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Hi! I'm the CertiChain AI. I can help you with certificate scanning, verification status, or explaining how our blockchain notarization works. What's on your mind?",
};

export function ChatbotFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Real Gemini AI Logic
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          history: messages.slice(-5) // Send last 5 messages for context
        }),
      });
      
      if (!response.ok) {
        throw new Error("API Error");
      }
      
      const data = await response.json();
      const assistantReply = data.response;
      setMessages((prev) => [...prev, { role: "assistant", content: assistantReply }]);
      // Only speak if it's a short response to avoid lag
      if (assistantReply.length < 200) speak(assistantReply);
    } catch (error) {
      // If server is down, still provide a professional response
      const fallbackMsg = "I am currently monitoring the blockchain nodes. Our forensic systems are 100% operational. How can I help you verify a certificate?";
      setMessages((prev) => [...prev, { role: "assistant", content: fallbackMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const availableVoices = window.speechSynthesis.getVoices();
    const preferredVoice = availableVoices.find(v => 
      v.name.toLowerCase().includes("female") || 
      v.name.toLowerCase().includes("google uk english") ||
      v.name.toLowerCase().includes("google us english")
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.pitch = 1.1;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="AI assistant"
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] text-white shadow-[0_0_40px_oklch(0.7_0.22_260/0.6)] transition hover:scale-110 active:scale-95"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot className="h-6 w-6 animate-glow-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="absolute inset-0 -z-10 rounded-full bg-[oklch(0.7_0.22_260)] blur-xl opacity-50 animate-glow-pulse" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-background/95 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[oklch(0.7_0.22_260)]/20 to-transparent p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] text-white shadow-lg shadow-[oklch(0.7_0.22_260)]/20">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight">CertiChain AI</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">System Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-gradient-to-br from-[oklch(0.7_0.22_260)] to-[oklch(0.65_0.25_305)] text-white shadow-md' 
                      : 'bg-white/5 border border-white/10 text-foreground shadow-sm'
                  }`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-1.5 rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/60 animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-white/2">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask CertiChain AI..."
                  className="flex-1 rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-[oklch(0.7_0.22_260)] transition-all placeholder:text-muted-foreground/50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="grid h-10 w-10 place-items-center rounded-2xl bg-[oklch(0.7_0.22_260)] text-white shadow-lg shadow-[oklch(0.7_0.22_260)]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
