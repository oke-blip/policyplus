import { KnowledgeCenterDraftPage } from "@/components/public/menu-draft-pages";
import { fetchKnowledgeCenterDraftData } from "@/lib/menu-draft-data";

export const dynamic = "force-dynamic";

export default async function KnowledgeCenterPage() {
  const { settings, posts } = await fetchKnowledgeCenterDraftData();
  return <KnowledgeCenterDraftPage settings={settings} posts={posts} />;
}
