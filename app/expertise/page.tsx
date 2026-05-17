import { ExpertiseDraftPage } from "@/components/public/menu-draft-pages";
import { fetchExpertiseDraftData } from "@/lib/menu-draft-data";

export const dynamic = "force-dynamic";

export default async function ExpertisePage() {
  const { settings, expertiseItems } = await fetchExpertiseDraftData();
  return <ExpertiseDraftPage settings={settings} expertiseItems={expertiseItems} />;
}
