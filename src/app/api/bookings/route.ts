import { db } from "@/db";
import { bookings, packages } from "@/db/schema";
import { calculateQuote, TIME_SLOTS } from "@/lib/pricing";
import { and, desc, eq, ne, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "SPA-";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function GET() {
  const rows = await db
    .select({
      booking: bookings,
      packageName: packages.name,
    })
    .from(bookings)
    .innerJoin(packages, eq(bookings.packageId, packages.id))
    .orderBy(desc(bookings.createdAt))
    .limit(100);
  return Response.json(rows);
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const packageId = Number(body.packageId);
  const people = Number(body.people);
  const customerName = String(body.customerName ?? "").trim();
  const customerEmail = String(body.customerEmail ?? "").trim();
  const customerPhone = String(body.customerPhone ?? "").trim();
  const bookingDate = String(body.bookingDate ?? "");
  const timeSlot = String(body.timeSlot ?? "");
  const notes = body.notes ? String(body.notes).slice(0, 500) : null;

  if (!packageId || !people || people < 1 || people > 20)
    return Response.json({ error: "Número de personas inválido (1-20)" }, { status: 400 });
  if (customerName.length < 2)
    return Response.json({ error: "Indica tu nombre" }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail))
    return Response.json({ error: "Email inválido" }, { status: 400 });
  if (customerPhone.length < 6)
    return Response.json({ error: "Teléfono inválido" }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate))
    return Response.json({ error: "Fecha inválida" }, { status: 400 });
  if (!(TIME_SLOTS as readonly string[]).includes(timeSlot))
    return Response.json({ error: "Franja horaria inválida" }, { status: 400 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(bookingDate + "T00:00:00") < today)
    return Response.json({ error: "La fecha debe ser hoy o posterior" }, { status: 400 });

  const [pkg] = await db.select().from(packages).where(eq(packages.id, packageId));
  if (!pkg) return Response.json({ error: "Paquete no encontrado" }, { status: 404 });

  // Comprobar capacidad de la franja
  const [{ used }] = await db
    .select({ used: sql<number>`coalesce(sum(${bookings.people}), 0)::int` })
    .from(bookings)
    .where(
      and(
        eq(bookings.packageId, packageId),
        eq(bookings.bookingDate, bookingDate),
        eq(bookings.timeSlot, timeSlot),
        ne(bookings.status, "cancelada"),
      ),
    );
  if (used + people > pkg.capacity) {
    return Response.json(
      { error: `Sólo quedan ${Math.max(0, pkg.capacity - used)} plazas en esa franja` },
      { status: 409 },
    );
  }

  // El precio SIEMPRE se recalcula en el servidor
  const quote = calculateQuote(pkg.pricePerPerson, people);

  const [created] = await db
    .insert(bookings)
    .values({
      code: genCode(),
      packageId,
      customerName,
      customerEmail,
      customerPhone,
      bookingDate,
      timeSlot,
      people: quote.people,
      subtotal: quote.subtotal,
      discountPct: quote.discountPct,
      discountAmount: quote.discountAmount,
      total: quote.total,
      notes,
    })
    .returning();

  return Response.json({ booking: created, package: pkg, quote }, { status: 201 });
}
