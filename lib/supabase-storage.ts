import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const STORAGE_FOLDERS = [
  "teams",
  "events",
  "insights",
  "knowledge",
  "settings",
  "partners",
  "testimonials",
] as const;
export type StorageFolder = (typeof STORAGE_FOLDERS)[number];

export const SETTINGS_SUBFOLDERS = [
  "branding",
  "hero",
  "about",
  "expertise",
  "approach",
] as const;
export type SettingsSubfolder = (typeof SETTINGS_SUBFOLDERS)[number];

export function isSettingsSubfolder(value: string): value is SettingsSubfolder {
  return (SETTINGS_SUBFOLDERS as readonly string[]).includes(value);
}

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const CV_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

let adminClient: SupabaseClient | null = null;

export function isStorageFolder(value: string): value is StorageFolder {
  return (STORAGE_FOLDERS as readonly string[]).includes(value);
}

export function isDataUrl(value: string): boolean {
  return value.trim().toLowerCase().startsWith("data:");
}

export function getStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? "public-assets";
}

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for storage uploads",
    );
  }

  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

function safeFileName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return (cleaned || "upload").slice(0, 120);
}

export function assertImageContentType(contentType: string): void {
  if (!contentType.startsWith("image/") && !IMAGE_TYPES.has(contentType)) {
    throw new Error("Only image files are allowed.");
  }
}

export function assertCvContentType(contentType: string): void {
  if (!CV_TYPES.has(contentType)) {
    throw new Error("Only PDF and Word documents are allowed.");
  }
}

export async function uploadPublicImage(
  folder: StorageFolder,
  bytes: ArrayBuffer,
  opts: { fileName: string; contentType: string; subfolder?: string },
): Promise<{ url: string; path: string }> {
  assertImageContentType(opts.contentType);

  const bucket = getStorageBucket();
  const extMatch = opts.fileName.match(/\.[a-z0-9]+$/i);
  const ext = extMatch?.[0]?.toLowerCase() ?? "";
  const base = safeFileName(opts.fileName.replace(/\.[^.]+$/, "") || "image");
  const sub =
    folder === "settings" && opts.subfolder
      ? `${folder}/${safeFileName(opts.subfolder)}`
      : folder;
  const path = `${sub}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${base}${ext}`;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: opts.contentType,
    upsert: false,
    cacheControl: "31536000",
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function uploadPublicCv(
  bytes: ArrayBuffer,
  opts: { fileName: string; contentType: string },
): Promise<{ url: string; path: string }> {
  assertCvContentType(opts.contentType);

  const bucket = getStorageBucket();
  const extMatch = opts.fileName.match(/\.[a-z0-9]+$/i);
  const ext = extMatch?.[0]?.toLowerCase() ?? "";
  const base = safeFileName(opts.fileName.replace(/\.[^.]+$/, "") || "cv");
  const path = `cv/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${base}${ext}`;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: opts.contentType,
    upsert: false,
    cacheControl: "31536000",
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function uploadEventImage(file: File): Promise<string> {
  const contentType = file.type || "application/octet-stream";
  const bytes = await file.arrayBuffer();
  const { url } = await uploadPublicImage("events", bytes, {
    fileName: file.name,
    contentType,
  });
  return url;
}

export function publicationFolderFromType(
  type: string | null | undefined,
): StorageFolder {
  return type?.toUpperCase() === "KNOWLEDGE" ? "knowledge" : "insights";
}

export function resolvePublicationUploadFolder(
  searchParams: URLSearchParams,
): StorageFolder | null {
  const folder = searchParams.get("folder");
  if (folder && isStorageFolder(folder)) {
    if (folder === "insights" || folder === "knowledge") return folder;
    return null;
  }
  const type = searchParams.get("type");
  if (type) return publicationFolderFromType(type);
  return null;
}

/** Parsed object path from a Supabase public object URL, or null if not our storage. */
export function parseSupabaseStoragePublicUrl(
  url: string,
): { bucket: string; path: string } | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const { pathname } = new URL(trimmed);
    const match = pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (!match?.[1] || !match[2]) return null;
    return {
      bucket: decodeURIComponent(match[1]),
      path: decodeURIComponent(match[2]),
    };
  } catch {
    return null;
  }
}

export function isSupabaseStoragePublicUrl(url: string): boolean {
  return parseSupabaseStoragePublicUrl(url) !== null;
}

/** Deletes one object by public URL. Skips external URLs and logs (does not throw) on failure. */
export async function deleteStorageObjectByUrl(
  url: string | null | undefined,
): Promise<void> {
  const parsed = parseSupabaseStoragePublicUrl(url ?? "");
  if (!parsed) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(parsed.bucket)
    .remove([parsed.path]);

  if (error) {
    console.warn(
      `[storage] Failed to delete ${parsed.bucket}/${parsed.path}:`,
      error.message,
    );
  }
}

/** Deletes unique Supabase storage objects; skips non-Supabase URLs. */
export async function deleteStorageObjectsByUrls(
  urls: Iterable<string>,
): Promise<void> {
  const unique = [
    ...new Set(
      [...urls]
        .map((u) => u.trim())
        .filter((u) => u.length > 0 && isSupabaseStoragePublicUrl(u)),
    ),
  ];
  await Promise.all(unique.map((url) => deleteStorageObjectByUrl(url)));
}

export function collectPostImageUrls(post: {
  image_url?: string | null;
  author_image?: string | null;
}): string[] {
  const urls: string[] = [];
  if (post.image_url?.trim()) urls.push(post.image_url.trim());
  if (post.author_image?.trim()) urls.push(post.author_image.trim());
  return urls;
}

export function collectEventImageUrls(event: { image?: string | null }): string[] {
  const image = event.image?.trim();
  return image ? [image] : [];
}
