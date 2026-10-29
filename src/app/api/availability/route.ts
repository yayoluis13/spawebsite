import { db } from "@/db";
import { bookings, packages } from "@/db/schema";
import { TIME_SLOTS } from "@/lib/pricing";
import { and, eq, ne, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** Devuelve, para una fecha y paquete, cuántas plazas quedan en cada franja horaria. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const packageId = Number(searchParams.get("packageId"));
  if (!date || !packageId) {
    return Response.json({ error: "date y packageId requeridos" }, { status: 400 });
  }
  const [pkg] = await db.select().from(packages).where(eq(packages.id, packageId));
  if (!pkg) return Response.json({ error: "Paquete no encontrado" }, { status: 404 });

  const used = await db
    .select({
      timeSlot: bookings.timeSlot,
      people: sql<number>`coalesce(sum(${bookings.people}), 0)::int`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.packageId, packageId),
        eq(bookings.bookingDate, date),
        ne(bookings.status, "cancelada"),
      ),
    )
    .groupBy(bookings.timeSlot);

  const usedMap = new Map(used.map((u) => [u.timeSlot, u.people]));
  const slots = TIME_SLOTS.map((slot) => ({
    slot,
    remaining: Math.max(0, pkg.capacity - (usedMap.get(slot) ?? 0)),
    capacity: pkg.capacity,
  }));
  return Response.json({ date, packageId, slots });
}
