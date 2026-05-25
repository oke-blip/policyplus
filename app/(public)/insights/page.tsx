import type { Metadata } from "next";

import { LatestInsights } from "@/components/public/LatestInsights";
import { CTAFooterSection } from "@/components/public/CTAFooterSection";
import { buildPublicSectionMetadata } from "@/lib/public-section-page-metadata";
import { getAllSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicSectionMetadata(
    { en: "Insights", id: "Wawasan" },
    {
      en: "Analysis, research, and policy perspectives from the Policy+ team.",
      id: "Analisis, riset, dan perspektif kebijakan dari tim Policy+.",
    },
  );
}

export default async function InsightsPage() {
  let settings: Record<string, unknown> = {};
  try {
    settings = await getAllSettings();
  } catch {
    settings = {};
  }

  return (
    <main className="w-full overflow-x-hidden bg-black text-white">
      <LatestInsights data={settings} variant="full" />
      <CTAFooterSection settings={settings} />
    </main>
  );
}
