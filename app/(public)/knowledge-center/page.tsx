import type { Metadata } from "next";

import { KnowledgeCenterSection } from "@/components/public/KnowledgeCenter";
import { CTAFooterSection } from "@/components/public/CTAFooterSection";
import { buildPublicSectionMetadata } from "@/lib/public-section-page-metadata";
import { getAllSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicSectionMetadata(
    { en: "Knowledge Center", id: "Pusat Pengetahuan" },
    {
      en: "Practical policy resources, reports, and field-ready evidence.",
      id: "Sumber daya kebijakan praktis, laporan, dan bukti siap lapangan.",
    },
  );
}

export default async function KnowledgeCenterPage() {
  let settings: Record<string, unknown> = {};
  try {
    settings = await getAllSettings();
  } catch {
    settings = {};
  }

  return (
    <main className="w-full overflow-x-hidden bg-black text-white">
      <KnowledgeCenterSection data={settings} variant="full" />
      <CTAFooterSection settings={settings} />
    </main>
  );
}
