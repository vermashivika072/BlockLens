import { useEffect, useRef } from "react";

export function GlowCursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = 0,
      y = 0,
      tx = 0,
      ty = 0;
    const move = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    window.addEventListener("mousemove", move);
    let raf = 0;
    const tick = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x - 150}px, ${y - 150}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] h-[300px] w-[300px] rounded-full opacity-60 mix-blend-screen"
      style={{ background: "radial-gradient(circle, oklch(0.7 0.22 260 / 0.5), transparent 60%)" }}
    />
  );
}
