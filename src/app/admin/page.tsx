import { db } from "@/db";
import { bookings, packages } from "@/db/schema";
import { formatMoney } from "@/lib/pricing";
import { desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const rows = await db
    .select({ b: bookings, packageName: packages.name })
    .from(bookings)
    .innerJoin(packages, eq(bookings.packageId, packages.id))
    .orderBy(desc(bookings.createdAt))
    .limit(200);

  const [stats] = await db
    .select({
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(${bookings.total}),0)::int`,
      people: sql<number>`coalesce(sum(${bookings.people}),0)::int`,
      saved: sql<number>`coalesce(sum(${bookings.discountAmount}),0)::int`,
    })
    .from(bookings);

  return (
    <main className="min-h-screen bg-ink px-6 py-16 text-cream">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Panel interno</p>
            <h1 className="mt-2 font-serif text-5xl font-light">Reservas</h1>
          </div>
          <a href="/" className="text-xs uppercase tracking-[0.25em] text-cream/50 hover:text-gold">
            ← Volver a la web
          </a>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            { l: "Reservas", v: String(stats.count) },
            { l: "Personas", v: String(stats.people) },
            { l: "Ingresos", v: formatMoney(stats.revenue) },
            { l: "Descuento grupal otorgado", v: formatMoney(stats.saved) },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl p-6">
              <p className="font-serif text-4xl text-gold">{s.v}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-cream/50">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="glass mt-10 overflow-x-auto rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-[0.2em] text-cream/50">
              <tr className="border-b border-cream/10">
                <th className="px-5 py-4">Código</th>
                <th className="px-5 py-4">Cliente</th>
                <th className="px-5 py-4">Ritual</th>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Pers.</th>
                <th className="px-5 py-4">Promo</th>
                <th className="px-5 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-cream/40">
                    Aún no hay reservas. ¡Haz la primera desde la web!
                  </td>
                </tr>
              )}
              {rows.map(({ b, packageName }) => (
                <tr key={b.id} className="border-b border-cream/5 hover:bg-cream/[0.03]">
                  <td className="px-5 py-4 font-mono text-gold">{b.code}</td>
                  <td className="px-5 py-4">
                    <p>{b.customerName}</p>
                    <p className="text-xs text-cream/40">{b.customerEmail} · {b.customerPhone}</p>
                  </td>
                  <td className="px-5 py-4">{packageName}</td>
                  <td className="px-5 py-4">
                    {b.bookingDate} <span className="text-cream/50">{b.timeSlot}</span>
                  </td>
                  <td className="px-5 py-4">{b.people}</td>
                  <td className="px-5 py-4">
                    {b.discountPct > 0 ? (
                      <span className="rounded-full bg-gold/15 px-2 py-1 text-xs text-gold">-{b.discountPct}%</span>
                    ) : (
                      <span className="text-cream/30">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right font-serif text-lg">{formatMoney(b.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
