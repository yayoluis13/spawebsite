/**
 * Lógica de precios compartida entre cliente y servidor.
 * Promo grupal: cuando MÁS DE 2 personas reservan el MISMO paquete/combo.
 */
export const GROUP_TIERS = [
  { min: 3, max: 4, pct: 15, label: "Trío & Cuarteto" },
  { min: 5, max: 7, pct: 22, label: "Grupo Zen" },
  { min: 8, max: Infinity, pct: 30, label: "Celebración Privada" },
] as const;

export const TIME_SLOTS = [
  "09:00",
  "10:30",
  "12:00",
  "13:30",
  "15:00",
  "16:30",
  "18:00",
  "19:30",
] as const;

export function getDiscountPct(people: number): number {
  if (people <= 2) return 0;
  const tier = GROUP_TIERS.find((t) => people >= t.min && people <= t.max);
  return tier ? tier.pct : 0;
}

export function getTierLabel(people: number): string | null {
  if (people <= 2) return null;
  const tier = GROUP_TIERS.find((t) => people >= t.min && people <= t.max);
  return tier ? tier.label : null;
}

export function calculateQuote(pricePerPerson: number, people: number) {
  const p = Math.max(1, Math.floor(people));
  const subtotal = pricePerPerson * p;
  const discountPct = getDiscountPct(p);
  const discountAmount = Math.round((subtotal * discountPct) / 100);
  const total = subtotal - discountAmount;
  const perPerson = Math.round(total / p);
  // cuánto falta para el próximo nivel
  const nextTier = GROUP_TIERS.find((t) => t.min > p);
  return {
    people: p,
    subtotal,
    discountPct,
    discountAmount,
    total,
    perPerson,
    tierLabel: getTierLabel(p),
    nextTier: nextTier
      ? { peopleNeeded: nextTier.min - p, pct: nextTier.pct, label: nextTier.label }
      : null,
  };
}

export function formatMoney(n: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
