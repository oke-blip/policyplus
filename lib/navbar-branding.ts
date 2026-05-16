export type NavbarBranding = {
  logoUrl: string | null;
  companyName: string;
};

const BRANDING_LOGO_KEYS = ["company_logo", "logo_url", "logo_dark_url"] as const;

function pickHttpsUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("https://")) return null;
  return trimmed;
}

function pickLogoForTheme(
  raw: Record<string, unknown>,
  preferDark: boolean,
): string | null {
  const lightKeys = ["logo_url", "company_logo"] as const;
  const darkKeys = ["logo_dark_url", "company_logo", "logo_url"] as const;
  const order = preferDark ? darkKeys : lightKeys;

  for (const key of order) {
    const url = pickHttpsUrl(raw[key]);
    if (url) return url;
  }
  return null;
}

export function pickBilingualCompanyName(
  raw: Record<string, unknown>,
  locale: string,
  fallback = "policy+",
): string {
  if (locale === "id") {
    const idValue = raw.company_name_id;
    if (typeof idValue === "string" && idValue.trim().length > 0) return idValue.trim();
  }
  const value = raw.company_name;
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  return fallback;
}

export function hasNavbarBrandingSource(raw: Record<string, unknown> | undefined): boolean {
  if (!raw) return false;

  if (BRANDING_LOGO_KEYS.some((key) => pickHttpsUrl(raw[key]) !== null)) {
    return true;
  }

  const name = raw.company_name;
  if (typeof name === "string" && name.trim().length > 0) return true;

  const nameId = raw.company_name_id;
  if (typeof nameId === "string" && nameId.trim().length > 0) return true;

  return false;
}

export function resolveNavbarBranding(
  raw: Record<string, unknown>,
  locale: string,
  resolvedTheme: "light" | "dark" | undefined,
): NavbarBranding {
  const preferDark = resolvedTheme !== "light";
  return {
    logoUrl: pickLogoForTheme(raw, preferDark),
    companyName: pickBilingualCompanyName(raw, locale),
  };
}
