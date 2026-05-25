# Policy Plus

Next.js 16 application for the Policy Plus website and admin CMS. The app uses Prisma for PostgreSQL access and Supabase for public asset storage.

## Local development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The app reads local environment variables from `.env.local` and `.env`. Do not commit those files.

## Deploy to Vercel

This repo is ready to deploy on Vercel using the standard Next.js preset. No custom `vercel.json` is required.

### Build settings

- Install command: `npm install`
- Build command: `npm run build`
- Output setting: leave the default Next.js setting in Vercel

The build script already runs `prisma generate` before `next build`.

### Required environment variables

Copy `.env.example` and set these values in the Vercel dashboard:

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional variables:

- `SUPABASE_STORAGE_BUCKET` (defaults to `public-assets`)
- `NEXT_PUBLIC_TEAM_LAYOUT` (defaults to `modern`)

### Important notes

- `NEXT_PUBLIC_SUPABASE_URL` must be present during build and runtime because `next.config.ts` uses it to allow optimized remote images from Supabase Storage.
- `JWT_SECRET` is required in production. Local development still allows the existing fallback secret, but production should always use a real secret.
- Prisma migrations are not run automatically by the Vercel build. If your database schema needs to change, run migrations separately with the correct database credentials before or during release.
- Generated folders such as `.next` and local env files are already ignored by `.gitignore`.

## Verification

The project has been verified with:

```bash
npm run build
```
