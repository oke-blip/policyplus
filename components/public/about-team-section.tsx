"use client";

import { AboutTeamSectionLegacy } from "@/components/public/about-team-section-legacy";
import { AboutTeamSectionModern } from "@/components/public/about-team-section-modern";
import { getTeamLayoutMode } from "@/lib/team-layout";
import type { TeamMemberCategory } from "@/lib/team-members";

export type AboutTeamMember = {
  id?: number;
  name: string;
  role: string;
  focus: string;
  image?: string;
  category?: TeamMemberCategory;
  isLeadership?: boolean;
  bio?: string;
};

export type AboutTeamSectionProps = {
  eyebrow: string;
  heading: string;
  sub: string;
  joinCta: string;
  keyboardHint: string;
  touchHint: string;
  members: AboutTeamMember[];
};

/** About page team block — modern grid by default; set `NEXT_PUBLIC_TEAM_LAYOUT=legacy` for the spotlight carousel. */
export function AboutTeamSection(props: AboutTeamSectionProps) {
  const mode = getTeamLayoutMode();
  if (mode === "legacy") {
    return <AboutTeamSectionLegacy {...props} />;
  }
  return <AboutTeamSectionModern {...props} />;
}
