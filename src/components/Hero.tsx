"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.3]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const titleRotate = useTransform(scrollYProgress, [0, 1], [0, 18]);

  // parallax 3D con el cursor
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });
  const layer1X = useTransform(smx, [-1, 1], [-30, 30]);
  const layer1Y = useTransform(smy, [-1, 1], [-20, 20]);
  const layer2X = useTransform(smx, [-1, 1], [50, -50]);
  const layer2Y = useTransform(smy, [-1, 1], [35, -35]);
  const rotX = useTransform(smy, [-1, 1], [8, -8]);
  const rotY = useTransform(smx, [-1, 1], [-8, 8]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <section ref={ref} id="top" className="relative h-[115vh] overflow-hidden">
      {/* Fondo parallax */}
      <motion.div
        style={{ y: bgY, scale: bgScale, backgroundImage: "url(/images/hero.jpg)" }}
        className="absolute inset-0 bg-cover bg-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/30 to-ink" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.12),transparent_60%)]" />

      {/* Vapor */}
      {[...Array(7)].map((_, i) => (
        <span
          key={i}
          className="steam absolute bottom-[20%] h-40 w-40 rounded-full bg-white/20 blur-3xl"
          style={{ left: `${10 + i * 13}%`, animationDelay: `${i * 0.9}s` }}
        />
      ))}

      {/* Capas 3D flotantes */}
      <motion.div
        style={{ x: layer1X, y: layer1Y, rotateX: rotX, rotateY: rotY, transformPerspective: 900 }}
        className="glass animate-float absolute left-[6%] top-[28%] hidden rounded-2xl px-5 py-4 lg:block"
      >
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Circuito termal</p>
        <p className="font-serif text-2xl">38 °C · Agua de manantial</p>
      </motion.div>
      <motion.div
        style={{ x: layer2X, y: layer2Y, rotateX: rotX, rotateY: rotY, transformPerspective: 900 }}
        className="glass animate-float absolute right-[7%] top-[58%] hidden rounded-2xl px-5 py-4 lg:block"
        transition={{ delay: 2 }}
      >
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Promo grupal</p>
        <p className="font-serif text-2xl">
          Hasta <span className="text-gradient-gold">-30%</span> desde 3 personas
        </p>
      </motion.div>

      {/* Título */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity, rotateX: titleRotate, transformPerspective: 1200 }}
        className="relative z-10 flex h-screen flex-col items-center justify-center px-6 text-center"
      >
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.5em" }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="mb-6 text-xs uppercase text-champagne/80"
        >
          Spa & Wellness · Rituales de lujo
        </motion.p>
        <h1 className="font-serif text-[clamp(3rem,11vw,9.5rem)] leading-[0.9] font-light">
          {"Respira.".split("").map((ch, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 80, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.3 + i * 0.06, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block"
            >
              {ch}
            </motion.span>
          ))}
          <br />
          <motion.span
            initial={{ opacity: 0, scale: 0.9, filter: "blur(16px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ delay: 1, duration: 1.4 }}
            className="text-gradient-gold italic"
          >
            Desconecta.
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-8 max-w-xl text-base font-light text-cream/75 md:text-lg"
        >
          Un santuario de piedra, vapor y oro donde el tiempo se detiene.
          Reserva en 60 segundos y deja que nosotros hagamos el resto.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <a
            href="#reservar"
            className="group relative overflow-hidden rounded-full bg-gold px-9 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-ink shadow-[0_0_60px_rgba(212,175,55,0.35)] transition hover:shadow-[0_0_90px_rgba(212,175,55,0.6)]"
          >
            <span className="relative z-10">Reservar ahora</span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </a>
          <a
            href="#rituales"
            className="rounded-full border border-cream/30 px-9 py-4 text-sm uppercase tracking-[0.2em] text-cream/80 transition hover:border-gold hover:text-gold"
          >
            Ver rituales
          </a>
        </motion.div>
      </motion.div>

      {/* Indicador de scroll */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-[18vh] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-cream/50"
      >
        <span>Desliza</span>
        <span className="h-10 w-px bg-gradient-to-b from-gold to-transparent" />
      </motion.div>
    </section>
  );
}
