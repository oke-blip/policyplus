import { getAllSettings } from "@/lib/settings";

import { LoginPageClient } from "./login-client";

export default async function LoginPage() {
  let initialSettings: Record<string, unknown> | undefined;

  try {
    initialSettings = await getAllSettings();
  } catch {
    initialSettings = undefined;
  }

  return <LoginPageClient initialSettings={initialSettings} />;
}
