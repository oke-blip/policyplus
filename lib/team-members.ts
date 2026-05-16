import {
  applySmartFallbackToArrayItems,
  SMART_FALLBACK_TEAM_MEMBER_FIELD_PAIRS,
} from "@/lib/cms-smart-fallback";

export type TeamMemberRecord = {
  id: number;
  name: string;
  name_id?: string;
  role: string;
  role_id?: string;
  focus: string;
  focus_id?: string;
  image?: string;
  order?: number;
};
/** Persist only empty strings or http(s) URLs — never base64 or blob previews. */
export function sanitizeTeamMemberImage(image: string | undefined): string {
  const trimmed = (image ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "";
}

export function parseTeamMembers(value: unknown): TeamMemberRecord[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((m): m is Record<string, unknown> => Boolean(m) && typeof m === "object")
    .map((m, index) => {
      const name = String(m.name ?? "").trim();
      const name_id = m.name_id ? String(m.name_id).trim() : undefined;
      const role = String(m.role ?? "").trim();
      const role_id = m.role_id ? String(m.role_id).trim() : undefined;
      const focus = String(m.focus ?? "").trim();
      const focus_id = m.focus_id ? String(m.focus_id).trim() : undefined;
      return {
        id: typeof m.id === "number" ? m.id : Date.now() + index,
        name,
        ...(name_id ? { name_id } : {}),
        role,
        ...(role_id ? { role_id } : {}),
        focus,
        ...(focus_id ? { focus_id } : {}),
        image: sanitizeTeamMemberImage(typeof m.image === "string" ? m.image : ""),
        order: typeof m.order === "number" ? m.order : index,
      };
    })
    .filter((m) => m.name.length > 0 || (m.name_id?.length ?? 0) > 0)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function normalizeTeamMemberOrder(members: TeamMemberRecord[]): TeamMemberRecord[] {
  return members.map((m, index) => ({ ...m, order: index }));
}

export function prepareTeamMembersForSave(members: TeamMemberRecord[]): TeamMemberRecord[] {
  const withFallback = applySmartFallbackToArrayItems(
    members as Record<string, unknown>[],
    SMART_FALLBACK_TEAM_MEMBER_FIELD_PAIRS,
  ) as TeamMemberRecord[];

  return normalizeTeamMemberOrder(
    withFallback
      .filter(
        (m) => m.name.trim().length > 0 || (m.name_id?.trim().length ?? 0) > 0,
      )
      .map((m) => {
        const name = m.name.trim();
        const name_id = m.name_id?.trim() ?? "";
        const role = m.role.trim();
        const role_id = m.role_id?.trim() ?? "";
        const focus = m.focus.trim();
        const focus_id = m.focus_id?.trim() ?? "";
        return {
          id: m.id,
          name,
          ...(name_id ? { name_id } : {}),
          role,
          ...(role_id ? { role_id } : {}),
          focus,
          ...(focus_id ? { focus_id } : {}),
          image: sanitizeTeamMemberImage(m.image),
          order: m.order,
        };
      }),
  );
}
export function hasUnsavedPortrait(members: TeamMemberRecord[]): boolean {
  return members.some((m) => {
    const image = (m.image ?? "").trim();
    return image.startsWith("data:") || image.startsWith("blob:");
  });
}
