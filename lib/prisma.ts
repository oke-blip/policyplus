import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// App runtime: pooled URL (Supabase transaction pooler, port 6543).
// DIRECT_URL is direct/session mode (5432) — use only for migrations (prisma.config.ts).
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL or DIRECT_URL for Prisma connection");
}

function createPrismaClient(): PrismaClient {
  // One small pool per process. Session mode caps total clients at pool_size (~15).
  const poolMax = process.env.NODE_ENV === "production" ? 5 : 1;

  const adapter = new PrismaPg({
    connectionString,
    max: poolMax,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });
}

/** After schema changes, dev HMR can keep an old client missing new model delegates or fields. */
const REQUIRED_DELEGATES = ["jobPosting", "jobApplication", "eventCategory"] as const;

const JOB_POSTING_BILINGUAL_SCALARS = [
  "title_id",
  "department_id",
  "location_id",
  "salaryRange_id",
  "description_id",
  "requirements_id",
] as const;

type RuntimeField = { name: string };
type RuntimeDataModel = {
  models?: Record<string, { fields?: readonly RuntimeField[] }>;
};

function jobPostingModelHasFields(
  models: RuntimeDataModel["models"],
  fieldNames: readonly string[],
): boolean {
  const fields = models?.JobPosting?.fields;
  if (!fields) return false;
  return fieldNames.every((name) => fields.some((field) => field.name === name));
}

function generatedSchemaHasJobBilingualFields(): boolean {
  const job = Prisma.dmmf.datamodel.models.find((model) => model.name === "JobPosting");
  if (!job) return false;
  return JOB_POSTING_BILINGUAL_SCALARS.every((name) =>
    job.fields.some((field) => field.name === name),
  );
}

function getClientRuntimeDataModel(client: PrismaClient): RuntimeDataModel | undefined {
  const internal = client as unknown as {
    _runtimeDataModel?: RuntimeDataModel;
    _engineConfig?: { runtimeDataModel?: RuntimeDataModel };
  };
  return internal._runtimeDataModel ?? internal._engineConfig?.runtimeDataModel;
}

function clientHasJobBilingualFields(client: PrismaClient): boolean {
  const runtime = getClientRuntimeDataModel(client);
  if (runtime?.models) {
    return jobPostingModelHasFields(runtime.models, JOB_POSTING_BILINGUAL_SCALARS);
  }
  return generatedSchemaHasJobBilingualFields();
}

function isPrismaClientReady(client: PrismaClient): boolean {
  const delegates = client as unknown as Record<string, { create?: unknown } | undefined>;
  const delegatesOk = REQUIRED_DELEGATES.every(
    (key) => delegates[key] != null && typeof delegates[key]?.create === "function",
  );
  if (!delegatesOk) return false;

  if (!generatedSchemaHasJobBilingualFields()) {
    console.error(
      "[prisma] Generated client is missing JobPosting *_id fields. Run: npx prisma generate, then restart the dev server and delete .next",
    );
    return false;
  }

  return clientHasJobBilingualFields(client);
}

async function disconnectClient(client: PrismaClient): Promise<void> {
  try {
    await client.$disconnect();
  } catch {
    // Best-effort — stale pool teardown during HMR.
  }
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (cached && isPrismaClientReady(cached)) {
    return cached;
  }

  if (cached) {
    void disconnectClient(cached);
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;

  if (!isPrismaClientReady(client)) {
    console.error(
      "[prisma] PrismaClient instance is stale (missing JobPosting bilingual fields). Restart the dev server and delete .next after running: npx prisma generate",
    );
  }

  return client;
}

export const prisma = getPrismaClient();

/** For diagnostics: whether the active client accepts JobPosting *_id writes. */
export function jobPostingSupportsBilingualFields(): boolean {
  return clientHasJobBilingualFields(prisma);
}
