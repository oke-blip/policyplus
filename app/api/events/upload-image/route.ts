import { NextResponse } from "next/server";
import { uploadEventImage } from "@/lib/supabase-storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const url = await uploadEventImage(file);
    return NextResponse.json({ url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to upload image";
    console.error("Event image upload failed:", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
