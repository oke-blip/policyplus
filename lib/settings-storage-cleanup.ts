import { collectSettingImageUrls } from "@/lib/collect-setting-image-urls";
import { parseSettingValue } from "@/lib/settings";
import { deleteStorageObjectsByUrls } from "@/lib/supabase-storage";
import { prisma } from "@/lib/prisma";

/** Deletes Supabase objects dropped from settings JSON (removed items or replaced URLs). */
export async function deleteOrphanedSettingImages(
  incoming: Record<string, unknown>,
): Promise<void> {
  const keys = Object.keys(incoming);
  if (keys.length === 0) return;

  const existing = await prisma.setting.findMany({
    where: { key: { in: keys } },
    select: { key: true, value: true },
  });
  const existingByKey = new Map(existing.map((row) => [row.key, row.value]));

  const orphans: string[] = [];

  for (const key of keys) {
    const oldValue = existingByKey.has(key)
      ? parseSettingValue(existingByKey.get(key))
      : undefined;
    const newValue = incoming[key];

    const oldUrls = new Set(collectSettingImageUrls(key, oldValue));
    const newUrls = new Set(collectSettingImageUrls(key, newValue));

    for (const url of oldUrls) {
      if (!newUrls.has(url)) orphans.push(url);
    }
  }

  await deleteStorageObjectsByUrls(orphans);
}
