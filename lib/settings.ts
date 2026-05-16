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

import { applySettingLocaleFields } from "@/lib/setting-locale";

export async function getAllSettings(): Promise<Record<string, unknown>> {
  const rows = await prisma.setting.findMany();
  return rows.reduce(
    (acc, row) => {
      applySettingLocaleFields(
        acc,
        row.key,
        parseSettingValue(row.value),
        row.value_id,
      );
      return acc;
    },
    {} as Record<string, unknown>,
  );
}
