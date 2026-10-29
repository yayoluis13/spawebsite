"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { Package } from "@/db/schema";
import { formatMoney } from "@/lib/pricing";
import TiltCard from "./TiltCard";

type Props = {
  packages: Package[];
  onSelect: (id: number) => void;
  selectedId: number | null;
};

export default function HorizontalPackages({ packages, onSelect, selectedId }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  // el scroll vertical se traduce en desplazamiento horizontal
  const x = useTransform(scrollYProgress, [0, 1], ["5%", "-72%"]);
  const bgX = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const titleX = useTransform(scrollYProgress, [0, 0.3], ["0%", "-120%"]);

  return (
    <section ref={ref} id="rituales" className="relative h-[400vh] bg-deep">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* texto gigante de fondo que se mueve en dirección opuesta */}
        <motion.p
          style={{ x: bgX }}
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap font-serif text-[28vw] leading-none text-cream/[0.03]"
        >
          RITUALES · RITUALES · RITUALES
        </motion.p>

        <motion.div style={{ x: titleX }} className="absolute left-6 top-24 z-10 md:left-16">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">02 — Rituales</p>
          <h2 className="font-serif text-5xl font-light md:text-7xl">
            Elige tu <span className="text-gradient-gold italic">ritual</span>
          </h2>
          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-cream/50">Sigue deslizando →</p>
        </motion.div>

        <motion.div style={{ x }} className="flex gap-10 pl-[8vw] pt-24 md:gap-14">
          {packages.map((p, i) => {
            const active = p.id === selectedId;
            return (
              <TiltCard
                key={p.id}
                className={`group relative h-[70vh] w-[82vw] shrink-0 overflow-hidden rounded-[2rem] md:w-[42vw] ${
                  active ? "ring-2 ring-gold" : ""
                }`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.4s] ease-out group-hover:scale-110"
                  style={{ backgroundImage: `url(${p.image})`, transform: "translateZ(-40px)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />

                <span className="absolute left-6 top-6 font-serif text-6xl text-cream/20" style={{ transform: "translateZ(40px)" }}>
                  0{i + 1}
                </span>
                {p.featured && (
                  <span className="absolute right-6 top-6 rounded-full bg-gold/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
                    Más reservado
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 p-7 md:p-10" style={{ transform: "translateZ(60px)" }}>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{p.durationMin} min · hasta {p.capacity} personas</p>
                  <h3 className="mt-2 font-serif text-4xl font-light md:text-5xl">{p.name}</h3>
                  <p className="mt-1 font-serif text-lg italic text-champagne/80">{p.tagline}</p>
                  <ul className="mt-4 hidden flex-wrap gap-2 md:flex">
                    {p.includes.map((inc) => (
                      <li key={inc} className="rounded-full border border-cream/15 px-3 py-1 text-[11px] text-cream/70">
                        {inc}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-cream/50">por persona</p>
                      <p className="font-serif text-4xl text-gold">{formatMoney(p.pricePerPerson)}</p>
                    </div>
                    <button
                      onClick={() => onSelect(p.id)}
                      className="rounded-full bg-cream px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:scale-105 hover:bg-gold"
                    >
                      {active ? "Seleccionado ✓" : "Reservar"}
                    </button>
                  </div>
                </div>
              </TiltCard>
            );
          })}

          {/* tarjeta final CTA */}
          <div className="glass flex h-[70vh] w-[70vw] shrink-0 flex-col items-center justify-center rounded-[2rem] text-center md:w-[32vw]">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold">¿Vienen en grupo?</p>
            <p className="mt-4 font-serif text-5xl font-light">
              Hasta <span className="text-gradient-gold">-30%</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-cream/60">
              Más de 2 personas en el mismo ritual activan automáticamente la promo grupal.
            </p>
            <a href="#promo" className="mt-8 rounded-full border border-gold px-6 py-3 text-xs uppercase tracking-[0.2em] text-gold transition hover:bg-gold hover:text-ink">
              Calcular ahorro
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
