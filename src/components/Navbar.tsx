"use client";

import { motion, useScroll, useSpring } from "framer-motion";

const links = [
  { href: "#rituales", label: "Rituales" },
  { href: "#promo", label: "Promo Grupal" },
  { href: "#experiencia", label: "Experiencia" },
  { href: "#reservar", label: "Reservar" },
];

export default function Navbar() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="glass mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full px-6 py-3">
        <a href="#top" className="font-serif text-2xl tracking-[0.3em] text-champagne">
          AUR<span className="text-gold">U</span>M
        </a>
        <nav className="hidden gap-8 text-xs uppercase tracking-[0.2em] text-cream/70 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition hover:text-gold">
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="#reservar"
          className="rounded-full bg-gold px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:scale-105 hover:bg-champagne"
        >
          Reservar
        </a>
      </div>
      <motion.div
        style={{ scaleX: progress }}
        className="mx-auto mt-2 h-[2px] max-w-6xl origin-left bg-gradient-to-r from-gold via-champagne to-sage"
      />
    </header>
  );
}
