import type { Metadata } from "next";

import { ExpertiseSection } from "@/components/public/Expertise";
import { CTAFooterSection } from "@/components/public/CTAFooterSection";
import { buildPublicSectionMetadata } from "@/lib/public-section-page-metadata";
import { getAllSettings, parseExpertiseItems } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicSectionMetadata(
    { en: "Our Expertise", id: "Keahlian Kami" },
    {
      en: "Policy advisory, evidence synthesis, and multi-sector engagement capabilities.",
      id: "Advisory kebijakan, sintesis bukti, dan kapabilitas keterlibatan multi-sektor.",
    },
  );
}

export default async function ExpertisePage() {
  let settings: Record<string, unknown> = {};
  try {
    settings = await getAllSettings();
  } catch {
    settings = {};
  }

  const expertiseItems = parseExpertiseItems(settings.expertise_items);

  return (
    <main className="w-full overflow-x-hidden bg-black text-white">
      <ExpertiseSection
        data={settings}
        initialItems={expertiseItems}
        variant="full"
        showArrows={false}
      />
      <CTAFooterSection settings={settings} />
    </main>
  );
}
