import type { Metadata } from "next";

import { UpcomingEvents } from "@/components/public/UpcomingEvents";
import { CTAFooterSection } from "@/components/public/CTAFooterSection";
import { buildPublicSectionMetadata } from "@/lib/public-section-page-metadata";
import { getAllSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicSectionMetadata(
    { en: "Events", id: "Acara" },
    {
      en: "Workshops, roundtables, and convenings that move policy into action.",
      id: "Lokakarya, diskusi meja bundar, dan pertemuan yang mendorong kebijakan menjadi aksi.",
    },
  );
}

export default async function EventsPage() {
  let settings: Record<string, unknown> = {};
  try {
    settings = await getAllSettings();
  } catch {
    settings = {};
  }

  return (
    <main className="w-full overflow-x-hidden bg-black text-white">
      <UpcomingEvents variant="full" data={settings} />
      <CTAFooterSection settings={settings} />
    </main>
  );
}
