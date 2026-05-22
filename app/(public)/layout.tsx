import { Navbar } from "@/components/Navbar";
import { getAllSettings } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let initialSettings: Record<string, unknown> | undefined;

  try {
    initialSettings = await getAllSettings();
  } catch {
    initialSettings = undefined;
  }

  return (
    <>
      <Navbar initialSettings={initialSettings} />
      {children}
    </>
  );
}
