import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "applications");
const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function saveApplicationCv(file: File): Promise<string> {
  if (file.size > MAX_CV_BYTES) {
    throw new Error("CV file must be 5 MB or smaller");
  }

  const mime = file.type || "";
  const ext = path.extname(file.name).toLowerCase();
  const allowedExt = [".pdf", ".doc", ".docx"];
  if (!ALLOWED_MIME.has(mime) && !allowedExt.includes(ext)) {
    throw new Error("CV must be a PDF or Word document");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const safeExt = allowedExt.includes(ext) ? ext : ".pdf";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/uploads/applications/${filename}`;
}
