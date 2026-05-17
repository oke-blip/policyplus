import { EventsDraftPage } from "@/components/public/menu-draft-pages";
import { fetchEventsDraftData } from "@/lib/menu-draft-data";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const { settings, events } = await fetchEventsDraftData();
  return <EventsDraftPage settings={settings} events={events} />;
}
