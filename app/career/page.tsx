import { Navbar } from "@/components/Navbar";
import { CareersPage } from "@/components/public/CareersPage";
import { getAllSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

/** Public careers / job openings page (navbar href: /career). */
export default async function CareerPage() {
  let initialHeroSettings: Record<string, unknown> | undefined;

  try {
    initialHeroSettings = await getAllSettings();
  } catch {
    initialHeroSettings = undefined;
  }

  return (
    <>
      <Navbar />
      <CareersPage initialHeroSettings={initialHeroSettings} />
    </>
  );
}
