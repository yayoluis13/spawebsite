import { getPackages } from "@/lib/packages";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getPackages();
  return Response.json(rows);
}
