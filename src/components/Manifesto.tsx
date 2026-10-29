"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const TEXT =
  "No vendemos masajes. Diseñamos silencios. Cada ritual en AURUM está pensado para que tu cuerpo recuerde lo que es estar completamente presente.";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1800;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to]);
  return (
    <span ref={ref}>
      {val.toLocaleString("es-ES")}
      {suffix}
    </span>
  );
}

export default function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = TEXT.split(" ");
  const lineX = useTransform(scrollYProgress, [0, 1], ["-100%", "0%"]);

  return (
    <section className="relative bg-ink px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div style={{ x: lineX }} className="mb-14 h-px w-full bg-gradient-to-r from-transparent via-gold to-transparent" />
        <p ref={ref} className="font-serif text-[clamp(1.8rem,4.5vw,3.6rem)] leading-tight font-light">
          {words.map((w, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return <Word key={i} progress={scrollYProgress} range={[start, end]} word={w} />;
          })}
        </p>

        <div className="mt-24 grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { v: 12, s: "", l: "años de rituales" },
            { v: 48000, s: "+", l: "huéspedes relajados" },
            { v: 4.9, s: "", l: "valoración media", float: true },
            { v: 30, s: "%", l: "ahorro máximo en grupo" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, rotateX: -30 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.12, duration: 0.8 }}
              style={{ transformPerspective: 800 }}
              className="glass rounded-2xl p-6"
            >
              <p className="font-serif text-4xl text-gold md:text-5xl">
                {s.float ? "4.9" : <Counter to={s.v} suffix={s.s} />}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-cream/60">{s.l}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Word({
  progress,
  range,
  word,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
  word: string;
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [10, 0]);
  const isAccent = ["silencios.", "presente."].includes(word);
  return (
    <motion.span
      style={{ opacity, y }}
      className={`mr-[0.28em] inline-block ${isAccent ? "text-gradient-gold italic" : ""}`}
    >
      {word}
    </motion.span>
  );
}
