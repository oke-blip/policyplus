import { prisma } from "@/lib/prisma";
import { parseSettingValue } from "@/lib/settings-utils";

export {
  parseSettingValue,
  parseHeroBanners,
  parseExpertiseItems,
  parseApproachItems,
  getLatestApproachItems,
  parseMethodologyItems,
  toMethodologySteps,
  type HeroBanner,
  type ExpertiseItem,
  type ApproachItem,
  type MethodologyItem,
  type MethodologyStep,
} from "@/lib/settings-utils";

export async function getAllSettings(): Promise<Record<string, unknown>> {
  const rows = await prisma.setting.findMany();
  return rows.reduce(
    (acc, row) => {
      acc[row.key] = parseSettingValue(row.value);
      return acc;
    },
    {} as Record<string, unknown>
  );
}
