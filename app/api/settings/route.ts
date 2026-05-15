import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseSettingValue } from "@/lib/settings";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = parseSettingValue(setting.value);
      return acc;
    }, {} as Record<string, unknown>);

    return NextResponse.json(settingsMap, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "Pragma": "no-cache",
      }
    });
  } catch (error: any) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ message: "Error fetching settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Data should be an object where keys are setting keys and values are the values to save
    const entries = Object.entries(data);

    // Use a transaction for reliability
    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: value as object },
          create: { key, value: value as object },
        })
      )
    );

    return NextResponse.json({ message: "Settings saved successfully" });
  } catch (error: any) {
    console.error("Failed to save settings:", error);
    return NextResponse.json({ message: "Error saving settings" }, { status: 500 });
  }
}
