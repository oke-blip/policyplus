import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Globe2,
  Heart,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";

export const ABOUT_VALUE_ICON_OPTIONS = [
  { id: "target", label: "Target", Icon: Target },
  { id: "users-round", label: "Collaboration", Icon: UsersRound },
  { id: "badge-check", label: "Trust", Icon: BadgeCheck },
  { id: "sparkles", label: "Innovation", Icon: Sparkles },
  { id: "heart", label: "Empathy", Icon: Heart },
  { id: "globe-2", label: "Global", Icon: Globe2 },
] as const;

export type AboutValueIconId = (typeof ABOUT_VALUE_ICON_OPTIONS)[number]["id"];

const ICON_MAP = Object.fromEntries(
  ABOUT_VALUE_ICON_OPTIONS.map((opt) => [opt.id, opt.Icon]),
) as Record<AboutValueIconId, LucideIcon>;

export function getAboutValueIcon(iconId?: string): LucideIcon | null {
  if (iconId && iconId in ICON_MAP) {
    return ICON_MAP[iconId as AboutValueIconId];
  }
  return null;
}

export function getDefaultAboutValueIconId(index: number): AboutValueIconId {
  return ABOUT_VALUE_ICON_OPTIONS[index % ABOUT_VALUE_ICON_OPTIONS.length].id;
}
