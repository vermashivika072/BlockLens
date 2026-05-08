"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function TrustGauge({ score }: { score: number }) {
  const circleRef = useRef<SVGCircleElement>(null);
  const valueRef = useRef({ value: 0 });
  const [display, setDisplay] = useState(0);
  const circumference = 2 * Math.PI * 42;
  const color =
    score >= 90
      ? "oklch(0.78 0.18 160)"
      : score >= 50
        ? "oklch(0.82 0.18 80)"
        : "oklch(0.65 0.25 25)";

  useEffect(() => {
    if (!circleRef.current) return;
    gsap.fromTo(
      circleRef.current,
      { strokeDashoffset: circumference },
      { strokeDashoffset: circumference * (1 - score / 100), duration: 1.5, ease: "power3.out" },
    );
    gsap.to(valueRef.current, {
      value: score,
      duration: 1.5,
      ease: "power3.out",
      onUpdate: () => setDisplay(Math.round(valueRef.current.value)),
    });
  }, [circumference, score]);

  return (
    <div className="relative mx-auto h-48 w-48">
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="oklch(0.3 0.04 270)" strokeWidth="9" />
        <circle
          ref={circleRef}
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-4xl font-bold text-gradient">{display}%</div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            {score >= 90 ? "Authentic" : score >= 50 ? "Review" : "Forged"}
          </div>
        </div>
      </div>
    </div>
  );
}
