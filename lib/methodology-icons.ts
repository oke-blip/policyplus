import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  FileText,
  Lightbulb,
  MessageSquare,
  Search,
  Settings,
  Target,
  Users,
} from "lucide-react";

export const METHODOLOGY_ICON_OPTIONS = [
  { id: "lightbulb", label: "Ideation", Icon: Lightbulb },
  { id: "search", label: "Research", Icon: Search },
  { id: "users", label: "Dialogue", Icon: Users },
  { id: "file-text", label: "Formulation", Icon: FileText },
  { id: "settings", label: "Implementation", Icon: Settings },
  { id: "message-square", label: "Communication", Icon: MessageSquare },
  { id: "target", label: "Strategy", Icon: Target },
  { id: "bar-chart", label: "Analytics", Icon: BarChart3 },
] as const;

export type MethodologyIconId = (typeof METHODOLOGY_ICON_OPTIONS)[number]["id"];

const ICON_MAP = Object.fromEntries(
  METHODOLOGY_ICON_OPTIONS.map((opt) => [opt.id, opt.Icon])
) as Record<MethodologyIconId, LucideIcon>;

export function getMethodologyIcon(iconId?: string): LucideIcon {
  if (iconId && iconId in ICON_MAP) {
    return ICON_MAP[iconId as MethodologyIconId];
  }
  return Lightbulb;
}

export function getDefaultMethodologyIconId(index: number): MethodologyIconId {
  return METHODOLOGY_ICON_OPTIONS[index % METHODOLOGY_ICON_OPTIONS.length].id;
}
