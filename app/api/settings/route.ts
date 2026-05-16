import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applySettingLocaleFields, splitSettingsSavePayload } from "@/lib/setting-locale";
import { parseSettingValue } from "@/lib/settings";
import { isDataUrl } from "@/lib/supabase-storage";
import {
  prepareSettingsPayloadForSave,
  sanitizePartnersForSave,
  sanitizeTestimonialsForSave,
} from "@/lib/settings-images";
import { parseTeamMembers, prepareTeamMembersForSave } from "@/lib/team-members";

function normalizeSettingValue(key: string, value: unknown): unknown {
  if (key === "partners") return sanitizePartnersForSave(value);
  if (key === "testimonials") return sanitizeTestimonialsForSave(value);

  if (key !== "team_members") return value;

  if (!Array.isArray(value)) {
    throw new Error("team_members must be an array.");
  }

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const image = (item as { image?: unknown }).image;
    if (typeof image === "string" && isDataUrl(image)) {
      throw new Error(
        "Team portraits must be uploaded to storage, not embedded as base64.",
      );
    }
  }

  return prepareTeamMembersForSave(parseTeamMembers(value));
}

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc, setting) => {
      applySettingLocaleFields(
        acc,
        setting.key,
        parseSettingValue(setting.value),
        setting.value_id,
      );
      return acc;
    }, {} as Record<string, unknown>);

    return NextResponse.json(settingsMap, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "Pragma": "no-cache",
      }
    });
  } catch (error: unknown) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ message: "Error fetching settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const raw = (await request.json()) as Record<string, unknown>;
    const { en, idByKey } = splitSettingsSavePayload(raw);
    const data = prepareSettingsPayloadForSave(en);

    const entries = Object.entries(data).map(([key, value]) => [
      key,
      normalizeSettingValue(key, value),
    ] as const);

    // One connection: parallel upserts exhaust Supabase session mode (pool_size ~15).
    await prisma.$transaction(
      async (tx) => {
        for (const [key, value] of entries) {
          const valueId = idByKey[key];
          await tx.setting.upsert({
            where: { key },
            update: {
              value: value as object,
              ...(key in idByKey
                ? {
                    value_id:
                      valueId === undefined ||
                      valueId === null ||
                      valueId === ""
                        ? null
                        : (valueId as object),
                  }
                : {}),
            },
            create: {
              key,
              value: value as object,
              ...(valueId !== undefined && valueId !== null
                ? { value_id: valueId as object }
                : {}),
            },
          });
        }

        for (const [key, valueId] of Object.entries(idByKey)) {
          if (key in data) continue;
          await tx.setting.upsert({
            where: { key },
            update: { value_id: valueId as object },
            create: {
              key,
              value: valueId as object,
              value_id: valueId as object,
            },
          });
        }
      },
      { maxWait: 15_000, timeout: 120_000 },
    );

    return NextResponse.json({ message: "Settings saved successfully" });
  } catch (error: unknown) {
    console.error("Failed to save settings:", error);
    const detail =
      error instanceof Error ? error.message : "Error saving settings";
    const status =
      error instanceof Error &&
      (detail.includes("base64") ||
        detail.includes("must be an array") ||
        detail.includes("https URL"))
        ? 400
        : 500;
    return NextResponse.json({ message: detail }, { status });
  }
}
