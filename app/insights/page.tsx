import { InsightsDraftPage } from "@/components/public/menu-draft-pages";
import { fetchInsightsDraftData } from "@/lib/menu-draft-data";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const { settings, posts } = await fetchInsightsDraftData();
  return <InsightsDraftPage settings={settings} posts={posts} />;
}
