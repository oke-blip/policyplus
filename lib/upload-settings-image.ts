import type { SettingsSubfolder } from "@/lib/supabase-storage";

const MAX_BYTES = 5 * 1024 * 1024;

export function dataUrlToUploadFileName(dataUrl: string, baseName = "cropped"): string {
  const mime = dataUrl.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const ext =
    mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : mime === "image/gif" ? "gif" : "jpg";
  return `${baseName}.${ext}`;
}

export function dataUrlToFile(dataUrl: string, fileName = "image.jpg"): File {
  const [header, base64] = dataUrl.split(",");
  const mime = header?.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(base64 ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], fileName, { type: mime });
}

export async function uploadSettingsImage(
  file: Blob,
  subfolder: SettingsSubfolder,
  fileName = "image.jpg",
): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const formData = new FormData();
  const uploadFile =
    file instanceof File ? file : new File([file], fileName, { type: file.type || "image/jpeg" });
  formData.append("file", uploadFile);

  const res = await fetch(
    `/api/upload?folder=settings&subfolder=${encodeURIComponent(subfolder)}`,
    { method: "POST", body: formData },
  );
  const body = (await res.json().catch(() => ({}))) as {
    url?: string;
    message?: string;
  };
  if (!res.ok || !body.url) {
    throw new Error(body.message || `Upload failed (${res.status}).`);
  }
  return body.url;
}
