export type TeamLayoutMode = "modern" | "legacy";

/** Public About team section layout. Set `NEXT_PUBLIC_TEAM_LAYOUT=legacy` to restore the spotlight carousel. */
export function getTeamLayoutMode(): TeamLayoutMode {
  const env = process.env.NEXT_PUBLIC_TEAM_LAYOUT?.trim().toLowerCase();
  if (env === "legacy") return "legacy";
  return "modern";
}
