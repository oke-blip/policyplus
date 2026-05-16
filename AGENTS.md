<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Supabase image uploads (CMS)

**Do not store images as base64 in the database.** Persist only public `https://` URLs in Prisma / `Setting` JSON.

### Shared client helper (new)

- **`lib/upload.ts`** — `uploadToSupabase(file, bucketName?)` uploads from the browser using `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Default bucket: `public-assets`. Returns the public URL string.

Use this when implementing **client-side** file pickers that should upload directly without a custom API route (ensure the bucket allows anon uploads via RLS/policy).

### Server-side uploads (admin CMS — preferred today)

- **`lib/supabase-storage.ts`** — service-role uploads, folder/subfolder paths, `isDataUrl()` helper.
- **Routes:** `POST /api/upload?folder=teams|events|settings&subfolder=...`, `POST /api/posts/upload-image?folder=insights|knowledge`, `POST /api/events/upload-image`.
- **Helpers:** `lib/upload-settings-image.ts` for settings crop uploads.

Existing admin pages already wired: teams (`/api/upload?folder=teams`), events, publications (posts upload-image), settings (settings subfolders). **Reuse these patterns** instead of inventing new storage code.

### Env

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, optional `SUPABASE_STORAGE_BUCKET` (default `public-assets`).
