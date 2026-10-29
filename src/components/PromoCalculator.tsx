"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Package } from "@/db/schema";
import { calculateQuote, formatMoney, GROUP_TIERS } from "@/lib/pricing";
import TiltCard from "./TiltCard";

type Props = {
  packages: Package[];
  selectedId: number | null;
  people: number;
  onSelect: (id: number) => void;
  onPeople: (n: number) => void;
};

export default function PromoCalculator({ packages, selectedId, people, onSelect, onPeople }: Props) {
  const pkg = packages.find((p) => p.id === selectedId) ?? packages[0];
  const quote = calculateQuote(pkg.pricePerPerson, people);
  const pct = ((people - 1) / 11) * 100;

  return (
    <section id="promo" className="relative overflow-hidden bg-ink px-6 py-32">
      <div className="absolute -left-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-gold/10 blur-[140px]" />
      <div className="absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-teal/40 blur-[140px]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">03 — Promo grupal</p>
          <h2 className="mt-3 font-serif text-5xl font-light leading-[1.05] md:text-6xl">
            Cuantos más sean,
            <br />
            <span className="text-gradient-gold italic">menos pagan.</span>
          </h2>
          <p className="mt-6 max-w-md text-cream/65">
            Reserva el mismo ritual para <strong className="text-cream">más de 2 personas</strong> y el descuento se
            aplica solo, sin códigos ni letra pequeña.
          </p>

          <div className="mt-10 space-y-3">
            {GROUP_TIERS.map((t) => {
              const active = people >= t.min && people <= t.max;
              return (
                <motion.div
                  key={t.label}
                  animate={{
                    scale: active ? 1.03 : 1,
                    borderColor: active ? "rgba(212,175,55,0.8)" : "rgba(241,227,192,0.1)",
                  }}
                  className="glass flex items-center justify-between rounded-2xl border px-5 py-4"
                >
                  <div>
                    <p className="font-serif text-xl">{t.label}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-cream/50">
                      {t.max === Infinity ? `${t.min}+ personas` : `${t.min} – ${t.max} personas`}
                    </p>
                  </div>
                  <p className={`font-serif text-3xl ${active ? "text-gradient-gold" : "text-cream/40"}`}>-{t.pct}%</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Calculadora 3D */}
        <TiltCard intensity={7} className="rounded-[2rem]">
          <div className="gold-border glass rounded-[2rem] p-8 md:p-10">
            <label className="text-[10px] uppercase tracking-[0.3em] text-cream/60">Ritual</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {packages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelect(p.id)}
                  className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                    p.id === pkg.id
                      ? "border-gold bg-gold/15 text-champagne"
                      : "border-cream/10 text-cream/60 hover:border-cream/30"
                  }`}
                >
                  {p.name}
                  <span className="block text-[10px] text-cream/40">{formatMoney(p.pricePerPerson)} / pers.</span>
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-end justify-between">
              <label className="text-[10px] uppercase tracking-[0.3em] text-cream/60">Personas</label>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={people}
                  initial={{ y: 20, opacity: 0, rotateX: 90 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="font-serif text-6xl text-gold"
                >
                  {people}
                </motion.span>
              </AnimatePresence>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={people}
              onChange={(e) => onPeople(Number(e.target.value))}
              style={{ ["--pct" as string]: `${pct}%` }}
              className="mt-3 w-full"
            />
            <div className="mt-1 flex justify-between text-[10px] text-cream/40">
              <span>1</span>
              <span className="text-gold">3 = promo activa</span>
              <span>12</span>
            </div>

            <div className="mt-8 space-y-2 border-t border-cream/10 pt-6 text-sm">
              <Row label={`${quote.people} × ${formatMoney(pkg.pricePerPerson)}`} value={formatMoney(quote.subtotal)} />
              <AnimatePresence>
                {quote.discountPct > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Row
                      label={`Promo ${quote.tierLabel} (-${quote.discountPct}%)`}
                      value={`− ${formatMoney(quote.discountAmount)}`}
                      accent
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-end justify-between pt-3">
                <span className="text-[10px] uppercase tracking-[0.3em] text-cream/60">Total</span>
                <motion.span key={quote.total} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="font-serif text-5xl">
                  {formatMoney(quote.total)}
                </motion.span>
              </div>
              <p className="text-right text-xs text-cream/50">
                = {formatMoney(quote.perPerson)} por persona
              </p>
            </div>

            <AnimatePresence mode="wait">
              {quote.nextTier ? (
                <motion.p
                  key={quote.nextTier.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 rounded-xl bg-gold/10 px-4 py-3 text-xs text-champagne"
                >
                  ✦ Añade {quote.nextTier.peopleNeeded} persona{quote.nextTier.peopleNeeded > 1 ? "s" : ""} más y
                  desbloqueas <strong>-{quote.nextTier.pct}%</strong> ({quote.nextTier.label}).
                </motion.p>
              ) : (
                <motion.p key="max" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 rounded-xl bg-gold/10 px-4 py-3 text-xs text-champagne">
                  ✦ Has alcanzado el máximo descuento. Incluye sala privada de cortesía.
                </motion.p>
              )}
            </AnimatePresence>

            <a
              href="#reservar"
              className="mt-6 block w-full rounded-full bg-gold py-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-ink transition hover:bg-champagne"
            >
              Reservar con este precio
            </a>
          </div>
        </TiltCard>
      </div>
    </section>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={accent ? "text-gold" : "text-cream/60"}>{label}</span>
      <span className={accent ? "text-gold" : ""}>{value}</span>
    </div>
  );
}
