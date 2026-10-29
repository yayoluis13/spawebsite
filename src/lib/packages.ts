import { db } from "@/db";
import { packages } from "@/db/schema";
import { SEED_PACKAGES } from "./seed-data";

/** Devuelve los paquetes y, si la tabla está vacía, la siembra automáticamente. */
export async function getPackages() {
  let rows = await db.select().from(packages).orderBy(packages.id);
  if (rows.length === 0) {
    await db.insert(packages).values(SEED_PACKAGES).onConflictDoNothing();
    rows = await db.select().from(packages).orderBy(packages.id);
  }
  return rows;
}
