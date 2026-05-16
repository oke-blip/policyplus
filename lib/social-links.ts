export const SOCIAL_PLATFORM_OPTIONS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "threads", label: "Threads" },
  { value: "website", label: "Website" },
] as const;

export type SocialLinkForm = {
  id: number;
  platform: string;
  url: string;
};

export function parseSocialLinksForm(raw: unknown): SocialLinkForm[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map((item, index) => ({
      id: typeof item.id === "number" ? item.id : Date.now() + index,
      platform:
        typeof item.platform === "string" && item.platform.length > 0
          ? item.platform
          : "linkedin",
      url: typeof item.url === "string" ? item.url : "",
    }));
}

export function labelForPlatform(platform: string): string {
  return SOCIAL_PLATFORM_OPTIONS.find((o) => o.value === platform)?.label ?? platform;
}
