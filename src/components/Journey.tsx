"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const STEPS = [
  { n: "I", t: "Llegada", d: "Té de jengibre, toalla caliente y un espacio sólo para ti.", img: "/images/pkg-ritual.jpg" },
  { n: "II", t: "Inmersión", d: "Circuito termal: sauna, vapor, piscina de contraste y jacuzzi al aire libre.", img: "/images/hero.jpg" },
  { n: "III", t: "Ritual", d: "El tratamiento que hayas elegido, ejecutado por manos expertas.", img: "/images/pkg-massage.jpg" },
  { n: "IV", t: "Retorno", d: "Sala de silencio, fruta fresca y la sensación de haber vuelto a empezar.", img: "/images/pkg-hammam.jpg" },
];

const WORDS = ["CALMA", "VAPOR", "ORO", "SILENCIO", "PIEDRA", "AGUA", "LUZ", "CALMA", "VAPOR", "ORO", "SILENCIO", "PIEDRA"];

export default function Journey() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Dos cintas que se mueven en direcciones opuestas y una diagonal
  const leftX = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const rightX = useTransform(scrollYProgress, [0, 1], ["-40%", "0%"]);
  const diagX = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const diagY = useTransform(scrollYProgress, [0, 1], ["-30%", "30%"]);

  return (
    <section ref={ref} id="experiencia" className="relative overflow-hidden bg-deep py-32">
      {/* Cintas multidireccionales */}
      <div className="pointer-events-none absolute inset-x-0 top-10 select-none space-y-2 opacity-[0.07]">
        <motion.div style={{ x: leftX }} className="whitespace-nowrap font-serif text-[9vw] leading-none">
          {WORDS.join(" · ")}
        </motion.div>
        <motion.div style={{ x: rightX }} className="whitespace-nowrap font-serif text-[9vw] italic leading-none">
          {[...WORDS].reverse().join(" · ")}
        </motion.div>
      </div>
      <motion.div
        style={{ x: diagX, y: diagY, rotate: -25 }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[140vh] w-[14vw] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-gold/10 to-transparent blur-2xl"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold">04 — La experiencia</p>
        <h2 className="mt-3 font-serif text-5xl font-light md:text-7xl">
          Cuatro actos.
          <span className="text-gradient-gold italic"> Un solo respiro.</span>
        </h2>

        <div className="mt-24 space-y-32">
          {STEPS.map((s, i) => (
            <Step key={s.n} step={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Step({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const even = index % 2 === 0;
  const imgX = useTransform(scrollYProgress, [0, 1], [even ? -120 : 120, even ? 60 : -60]);
  const imgRotate = useTransform(scrollYProgress, [0, 0.5, 1], [even ? -12 : 12, 0, even ? 6 : -6]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.95]);
  const textX = useTransform(scrollYProgress, [0, 1], [even ? 80 : -80, even ? -40 : 40]);
  const numY = useTransform(scrollYProgress, [0, 1], [120, -120]);

  return (
    <div ref={ref} className={`grid items-center gap-10 md:grid-cols-2 ${even ? "" : "md:[&>*:first-child]:order-2"}`}>
      <motion.div
        style={{ x: imgX, rotateY: imgRotate, scale: imgScale, transformPerspective: 1000 }}
        className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
      >
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${step.img})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        <motion.span style={{ y: numY }} className="absolute -right-4 bottom-4 font-serif text-[10rem] leading-none text-gold/30">
          {step.n}
        </motion.span>
      </motion.div>
      <motion.div style={{ x: textX }} className="relative">
        <p className="font-serif text-7xl text-cream/10">{step.n}</p>
        <h3 className="-mt-8 font-serif text-5xl font-light">{step.t}</h3>
        <p className="mt-5 max-w-sm text-lg font-light text-cream/65">{step.d}</p>
        <div className="mt-8 h-px w-24 bg-gold" />
      </motion.div>
    </div>
  );
}
