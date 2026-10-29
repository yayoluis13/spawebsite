"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { Package } from "@/db/schema";
import { calculateQuote, formatMoney, TIME_SLOTS } from "@/lib/pricing";

type Props = {
  packages: Package[];
  selectedId: number | null;
  people: number;
  onSelect: (id: number) => void;
  onPeople: (n: number) => void;
};

type Slot = { slot: string; remaining: number; capacity: number };
type Confirmation = {
  code: string;
  total: number;
  discountPct: number;
  packageName: string;
  date: string;
  time: string;
  people: number;
};

function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export default function BookingSection({ packages, selectedId, people, onSelect, onPeople }: Props) {
  const pkg = packages.find((p) => p.id === selectedId) ?? packages[0];
  const quote = useMemo(() => calculateQuote(pkg.pricePerPerson, people), [pkg, people]);

  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState<string>("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoadingSlots(true);
    fetch(`/api/availability?date=${date}&packageId=${pkg.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setSlots(d.slots ?? []);
      })
      .catch(() => !cancelled && setSlots(TIME_SLOTS.map((s) => ({ slot: s, remaining: pkg.capacity, capacity: pkg.capacity }))))
      .finally(() => !cancelled && setLoadingSlots(false));
    return () => {
      cancelled = true;
    };
  }, [date, pkg.id, pkg.capacity, confirmation]);

  useEffect(() => {
    const cur = slots.find((s) => s.slot === slot);
    if (cur && cur.remaining < people) setSlot("");
  }, [slots, slot, people]);

  async function submit() {
    setError(null);
    if (!slot) return setError("Elige una franja horaria");
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          people,
          bookingDate: date,
          timeSlot: slot,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo completar la reserva");
      setConfirmation({
        code: data.booking.code,
        total: data.booking.total,
        discountPct: data.booking.discountPct,
        packageName: data.package.name,
        date,
        time: slot,
        people,
      });
      setForm({ name: "", email: "", phone: "", notes: "" });
      setSlot("");
      setStep(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  const canStep2 = Boolean(slot);
  const canSubmit = form.name.length >= 2 && /\S+@\S+\.\S+/.test(form.email) && form.phone.length >= 6;

  return (
    <section id="reservar" className="relative overflow-hidden bg-ink px-6 py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(18,59,56,0.6),transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">05 — Reserva</p>
          <h2 className="mt-3 font-serif text-5xl font-light md:text-7xl">
            Tu momento <span className="text-gradient-gold italic">empieza aquí</span>
          </h2>
          <p className="mt-4 text-cream/60">Disponibilidad en tiempo real · Confirmación inmediata · Sin pago anticipado</p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="gold-border glass rounded-[2rem] p-7 md:p-10"
          >
            {/* Stepper */}
            <div className="mb-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em]">
              {["Ritual & fecha", "Tus datos"].map((l, i) => (
                <button
                  key={l}
                  onClick={() => (i === 0 || canStep2) && setStep(i + 1)}
                  className={`flex items-center gap-2 ${step === i + 1 ? "text-gold" : "text-cream/40"}`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${step === i + 1 ? "border-gold bg-gold text-ink" : "border-cream/30"}`}>
                    {i + 1}
                  </span>
                  {l}
                  {i === 0 && <span className="mx-2 h-px w-10 bg-cream/20" />}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="s1" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="space-y-7">
                  <Field label="Ritual">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {packages.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => onSelect(p.id)}
                          className={`flex items-center gap-3 rounded-xl border p-2 text-left transition ${
                            p.id === pkg.id ? "border-gold bg-gold/10" : "border-cream/10 hover:border-cream/30"
                          }`}
                        >
                          <span className="h-12 w-12 shrink-0 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${p.image})` }} />
                          <span>
                            <span className="block text-sm">{p.name}</span>
                            <span className="block text-[11px] text-cream/50">
                              {p.durationMin}′ · {formatMoney(p.pricePerPerson)}/pers.
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label="Fecha">
                      <input
                        type="date"
                        min={todayISO()}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-xl border border-cream/15 bg-transparent px-4 py-3 text-cream outline-none focus:border-gold"
                      />
                    </Field>
                    <Field label={`Personas · ${people}`}>
                      <div className="flex items-center gap-3">
                        <Stepper onClick={() => onPeople(Math.max(1, people - 1))}>−</Stepper>
                        <input
                          type="range"
                          min={1}
                          max={12}
                          value={people}
                          onChange={(e) => onPeople(Number(e.target.value))}
                          style={{ ["--pct" as string]: `${((people - 1) / 11) * 100}%` }}
                          className="w-full"
                        />
                        <Stepper onClick={() => onPeople(Math.min(12, people + 1))}>+</Stepper>
                      </div>
                      {people > 2 ? (
                        <p className="mt-2 text-xs text-gold">✦ Promo grupal activa: -{quote.discountPct}%</p>
                      ) : (
                        <p className="mt-2 text-xs text-cream/40">A partir de 3 personas: descuento automático</p>
                      )}
                    </Field>
                  </div>

                  <Field label={loadingSlots ? "Consultando disponibilidad…" : "Franja horaria"}>
                    <div className="grid grid-cols-4 gap-2">
                      {(slots.length ? slots : TIME_SLOTS.map((s) => ({ slot: s, remaining: pkg.capacity, capacity: pkg.capacity }))).map((s) => {
                        const full = s.remaining < people;
                        const active = slot === s.slot;
                        return (
                          <button
                            key={s.slot}
                            disabled={full}
                            onClick={() => setSlot(s.slot)}
                            className={`relative rounded-xl border py-3 text-sm transition ${
                              active
                                ? "border-gold bg-gold text-ink"
                                : full
                                  ? "cursor-not-allowed border-cream/5 text-cream/25 line-through"
                                  : "border-cream/15 hover:border-gold"
                            }`}
                          >
                            {s.slot}
                            {!full && s.remaining <= 3 && !active && (
                              <span className="absolute -right-1 -top-1 rounded-full bg-gold px-1.5 text-[9px] font-bold text-ink">
                                {s.remaining}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <button
                    disabled={!canStep2}
                    onClick={() => setStep(2)}
                    className="w-full rounded-full bg-gold py-4 text-xs font-semibold uppercase tracking-[0.25em] text-ink transition hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continuar →
                  </button>
                </motion.div>
              ) : (
                <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input label="Nombre completo" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                    <Input label="Teléfono" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
                  </div>
                  <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
                  <Field label="Notas (alergias, ocasión especial…)">
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full resize-none rounded-xl border border-cream/15 bg-transparent px-4 py-3 outline-none focus:border-gold"
                    />
                  </Field>
                  {error && <p className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-300">{error}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="rounded-full border border-cream/20 px-6 py-4 text-xs uppercase tracking-[0.25em] text-cream/70 hover:border-gold">
                      ← Atrás
                    </button>
                    <button
                      disabled={!canSubmit || submitting}
                      onClick={submit}
                      className="flex-1 rounded-full bg-gold py-4 text-xs font-semibold uppercase tracking-[0.25em] text-ink transition hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {submitting ? "Confirmando…" : `Confirmar reserva · ${formatMoney(quote.total)}`}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Resumen sticky */}
          <motion.aside
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="h-fit lg:sticky lg:top-28"
          >
            <div className="overflow-hidden rounded-[2rem] bg-deep shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
              <div className="relative h-44 bg-cover bg-center" style={{ backgroundImage: `url(${pkg.image})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-deep to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Tu reserva</p>
                  <p className="font-serif text-3xl">{pkg.name}</p>
                </div>
              </div>
              <div className="space-y-3 p-6 text-sm">
                <Line k="Fecha" v={new Date(date + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })} />
                <Line k="Hora" v={slot || "—"} />
                <Line k="Personas" v={String(people)} />
                <Line k="Duración" v={`${pkg.durationMin} min`} />
                <div className="my-3 h-px bg-cream/10" />
                <Line k="Subtotal" v={formatMoney(quote.subtotal)} />
                {quote.discountPct > 0 && (
                  <Line k={`Promo grupal −${quote.discountPct}%`} v={`− ${formatMoney(quote.discountAmount)}`} accent />
                )}
                <div className="flex items-end justify-between pt-2">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-cream/60">Total</span>
                  <motion.span key={quote.total} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="font-serif text-4xl text-gold">
                    {formatMoney(quote.total)}
                  </motion.span>
                </div>
                {quote.discountPct > 0 && (
                  <p className="text-right text-xs text-sage">Ahorras {formatMoney(quote.discountAmount)} 🎉</p>
                )}
              </div>
            </div>
            <p className="mt-4 text-center text-[11px] text-cream/40">
              Cancelación gratuita hasta 24h antes · Pago en recepción
            </p>
          </motion.aside>
        </div>
      </div>

      {/* Modal confirmación */}
      <AnimatePresence>
        {confirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/85 p-6 backdrop-blur-md"
            onClick={() => setConfirmation(null)}
          >
            <motion.div
              initial={{ scale: 0.8, rotateX: 30, opacity: 0 }}
              animate={{ scale: 1, rotateX: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{ transformPerspective: 1000 }}
              onClick={(e) => e.stopPropagation()}
              className="gold-border glass relative w-full max-w-md rounded-[2rem] p-10 text-center"
            >
              <div className="ripple relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold text-3xl text-ink">
                ✓
              </div>
              <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-gold">Reserva confirmada</p>
              <p className="mt-2 font-serif text-5xl tracking-widest">{confirmation.code}</p>
              <p className="mt-4 text-cream/70">
                {confirmation.packageName} · {confirmation.people} persona{confirmation.people > 1 ? "s" : ""}
                <br />
                {new Date(confirmation.date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long" })} a las {confirmation.time}
              </p>
              <p className="mt-4 font-serif text-3xl text-gold">{formatMoney(confirmation.total)}</p>
              {confirmation.discountPct > 0 && (
                <p className="text-xs text-sage">Promo grupal aplicada: -{confirmation.discountPct}%</p>
              )}
              <p className="mt-6 text-xs text-cream/50">Te hemos enviado los detalles por email. Guarda tu código.</p>
              <button onClick={() => setConfirmation(null)} className="mt-6 rounded-full border border-gold px-8 py-3 text-xs uppercase tracking-[0.25em] text-gold hover:bg-gold hover:text-ink">
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-cream/60">{label}</p>
      {children}
    </div>
  );
}
function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <Field label={label}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-cream/15 bg-transparent px-4 py-3 outline-none focus:border-gold"
      />
    </Field>
  );
}
function Stepper({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream/20 text-lg hover:border-gold hover:text-gold">
      {children}
    </button>
  );
}
function Line({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className={accent ? "text-gold" : "text-cream/55"}>{k}</span>
      <span className={`text-right capitalize ${accent ? "text-gold" : ""}`}>{v}</span>
    </div>
  );
}
