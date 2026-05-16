import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  isSettingsSubfolder,
  isStorageFolder,
  uploadPublicImage,
} from "@/lib/supabase-storage";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.username) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const folderParam = url.searchParams.get("folder") ?? "teams";
  if (!isStorageFolder(folderParam)) {
    return NextResponse.json(
      {
        message:
          "Invalid folder. Allowed: teams, events, insights, knowledge, settings, partners, testimonials.",
      },
      { status: 400 },
    );
  }

  const subfolderParam = url.searchParams.get("subfolder");
  if (folderParam === "settings") {
    if (!subfolderParam || !isSettingsSubfolder(subfolderParam)) {
      return NextResponse.json(
        {
          message:
            "Settings uploads require subfolder=branding|hero|about|expertise|approach.",
        },
        { status: 400 },
      );
    }
  } else if (subfolderParam) {
    return NextResponse.json(
      { message: "subfolder is only valid when folder=settings." },
      { status: 400 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Missing file" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { message: `File must be under ${MAX_BYTES / 1024 / 1024} MB.` },
        { status: 400 },
      );
    }

    const contentType = file.type || "application/octet-stream";
    const bytes = await file.arrayBuffer();
    const { url, path } = await uploadPublicImage(folderParam, bytes, {
      fileName: file.name,
      contentType,
      subfolder:
        folderParam === "settings" && subfolderParam
          ? subfolderParam
          : undefined,
    });

    return NextResponse.json({ url, path });
  } catch (error: unknown) {
    console.error("Upload failed:", error);
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
