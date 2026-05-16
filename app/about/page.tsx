import { Navbar } from "@/components/Navbar";
import {
  AboutFullPage,
  type AboutPageSettings,
} from "@/components/public/about-full-page";
import { hasAboutPageSource, pickAboutSettings } from "@/lib/about-intro-settings";
import { getAllSettings } from "@/lib/settings";
import { parseTeamMembers, type TeamMemberRecord } from "@/lib/team-members";

export const dynamic = "force-dynamic";

/** Fixed navigation + scroll-snap About page (final section: shared CTA + footer from CMS). */
export default async function AboutPage() {
  let initialTeamMembers: TeamMemberRecord[] | undefined;
  let initialAboutSettings: AboutPageSettings | undefined;
  let initialCtaSettings: Record<string, unknown> | undefined;

  try {
    const settings = await getAllSettings();
    const raw = settings as Record<string, unknown>;
    initialTeamMembers = parseTeamMembers(settings.team_members);
    initialAboutSettings = hasAboutPageSource(raw) ? pickAboutSettings(raw) : undefined;
    initialCtaSettings = raw;
  } catch {
    initialTeamMembers = undefined;
    initialAboutSettings = undefined;
    initialCtaSettings = undefined;
  }

  return (
    <>
      <Navbar />
      <AboutFullPage
        initialTeamMembers={initialTeamMembers}
        initialAboutSettings={initialAboutSettings}
        initialCtaSettings={initialCtaSettings}
      />
    </>
  );
}
