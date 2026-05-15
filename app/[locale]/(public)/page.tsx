import { AboutSection } from "@/components/public/about";
import { ApproachSection } from "@/components/public/Approach";
import { ExpertiseSection } from "@/components/public/Expertise";
import { KnowledgeCenterSection } from "@/components/public/KnowledgeCenter";
import { LatestInsights } from "@/components/public/LatestInsights";
import { MethodologySection } from "@/components/public/Methodology";
import { Partners } from "@/components/public/Partners";
import { Testimonials } from "@/components/public/Testimonials";
import { UpcomingEvents } from "@/components/public/UpcomingEvents";
import { PublicHeroSection } from "@/components/public/hero-section";
import { CTAFooterSection } from "@/components/public/CTAFooterSection";
import {
  getAllSettings,
  getLatestApproachItems,
  parseExpertiseItems,
  parseHeroBanners,
  toMethodologySteps,
} from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function PublicHomePage() {
  let settings: Record<string, unknown> = {};
  try {
    settings = await getAllSettings();
  } catch {
    settings = {};
  }

  const heroBanners = parseHeroBanners(settings.hero_banners);
  const expertiseItems = parseExpertiseItems(settings.expertise_items);
  const approachItems = getLatestApproachItems(settings.approach_items, 4);
  const methodologySteps = toMethodologySteps(settings.methodology_items);

  return (
    <div className="relative h-svh w-full overflow-hidden bg-white text-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-br from-zinc-50 via-white to-zinc-100"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[size:18px_18px] opacity-45"
      />

      <main
        className="h-full w-full overflow-x-hidden overflow-y-auto overscroll-y-contain scroll-smooth hide-scrollbar snap-y snap-proximity"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <PublicHeroSection data={settings} initialBanners={heroBanners} />
        <AboutSection data={settings} />

        <ExpertiseSection data={settings} initialItems={expertiseItems} />

        <ApproachSection data={settings} initialItems={approachItems} />

        <MethodologySection data={settings} initialSteps={methodologySteps} />

        <KnowledgeCenterSection />

        <Testimonials data={settings} />
        <Partners data={settings} />

        <UpcomingEvents />

        <LatestInsights data={settings} />

        <CTAFooterSection settings={settings} />
      </main>
    </div>
  );
}
