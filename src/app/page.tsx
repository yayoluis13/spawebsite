import SpaExperience from "@/components/SpaExperience";
import { getPackages } from "@/lib/packages";

export const dynamic = "force-dynamic";

export default async function Home() {
  const pkgs = await getPackages();
  return <SpaExperience packages={pkgs} />;
}
