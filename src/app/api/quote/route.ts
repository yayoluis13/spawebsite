import { db } from "@/db";
import { packages } from "@/db/schema";
import { calculateQuote } from "@/lib/pricing";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const packageId = Number(searchParams.get("packageId"));
  const people = Number(searchParams.get("people") ?? 1);
  if (!packageId || Number.isNaN(people)) {
    return Response.json({ error: "Parámetros inválidos" }, { status: 400 });
  }
  const [pkg] = await db.select().from(packages).where(eq(packages.id, packageId));
  if (!pkg) return Response.json({ error: "Paquete no encontrado" }, { status: 404 });
  return Response.json({ package: pkg, quote: calculateQuote(pkg.pricePerPerson, people) });
}
