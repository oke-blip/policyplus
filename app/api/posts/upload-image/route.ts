import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  resolvePublicationUploadFolder,
  uploadPublicCv,
  uploadPublicImage,
} from "@/lib/supabase-storage";

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderParam = searchParams.get("folder");
  const isCvUpload = folderParam === "cv";

  if (!isCvUpload) {
    const session = await getSession();
    if (!session?.username) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const folder = resolvePublicationUploadFolder(searchParams);
    if (!folder) {
      return NextResponse.json(
        {
          message:
            "Invalid folder or type. Use folder=insights|knowledge or type=INSIGHT|KNOWLEDGE.",
        },
        { status: 400 },
      );
    }
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { message: `File must be under ${MAX_BYTES / 1024 / 1024} MB.` },
        { status: 400 },
      );
    }

    const contentType = file.type || "application/octet-stream";
    const bytes = await file.arrayBuffer();

    if (isCvUpload) {
      const { url, path } = await uploadPublicCv(bytes, {
        fileName: file.name,
        contentType,
      });
      return NextResponse.json({ url, path });
    }

    const folder = resolvePublicationUploadFolder(searchParams)!;
    const { url, path } = await uploadPublicImage(folder, bytes, {
      fileName: file.name,
      contentType,
    });

    return NextResponse.json({ url, path });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to upload file";
    console.error("Upload failed:", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
