import { WorkDraftPage } from "@/components/public/menu-draft-pages";
import { fetchWorkDraftData } from "@/lib/menu-draft-data";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const { settings, approachItems } = await fetchWorkDraftData();
  return <WorkDraftPage settings={settings} approachItems={approachItems} />;
}
