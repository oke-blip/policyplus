import { prisma } from "@/lib/prisma";
import { Prisma, type PostStatus, type PostType } from "@/app/generated/prisma";

/**
 * Post.author_role, author_bio, tags may be absent until the DB is synced.
 * Run (with dev server stopped to free the connection pool):
 *   npx prisma db push
 */

const LEGACY_POST_SELECT = {
  id: true,
  title: true,
  slug: true,
  content: true,
  image_url: true,
  author_name: true,
  author_image: true,
  status: true,
  type: true,
  category: true,
  createdAt: true,
  updatedAt: true,
} as const;

let useLegacyPostSelect: boolean | null = null;

function collectErrorText(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const parts = [error.name, error.message];
  if (error.cause) parts.push(collectErrorText(error.cause));
  return parts.join(" ");
}

export function isMissingColumnError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2022";
  }
  const msg = collectErrorText(error);
  return (
    msg.includes("does not exist in the current database") ||
    msg.includes("ColumnNotFound") ||
    msg.includes("DriverAdapterError")
  );
}

export function schemaOutOfDateMessage(): string {
  return "Database schema is out of date. Stop the dev server, then run: npx prisma db push";
}

type FindPostsArgs = {
  where: {
    status?: PostStatus;
    category?: string;
    type?: PostType;
  };
  take?: number;
  /** Force legacy select (skip full-schema probe). Prefer omitting — findPosts auto-detects. */
  legacySelect?: boolean;
};

async function findPostsWithLegacySelect({ where, take }: FindPostsArgs) {
  const rows = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
    select: LEGACY_POST_SELECT,
  });

  return rows.map((row) => ({
    ...row,
    title_id: null,
    content_id: null,
    author_name_id: null,
    author_role: null,
    author_role_id: null,
    author_bio: null,
    author_bio_id: null,
    tags: null,
    tags_id: null,
    category_id: null,
  }));
}

export async function findPosts({ where, take, legacySelect }: FindPostsArgs) {
  const preferLegacy =
    legacySelect === true ||
    (legacySelect !== false && useLegacyPostSelect === true);

  if (preferLegacy) {
    return findPostsWithLegacySelect({ where, take });
  }

  const query = {
    where,
    orderBy: { createdAt: "desc" as const },
    take,
  };

  try {
    const posts = await prisma.post.findMany(query);
    useLegacyPostSelect = false;
    return posts;
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    useLegacyPostSelect = true;
    return findPostsWithLegacySelect({ where, take });
  }
}

type FindPostByIdentifierArgs = {
  idOrSlug: string;
  where?: {
    status?: PostStatus;
    type?: PostType;
  };
  legacySelect?: boolean;
};

function buildPostLookupWhere(
  idOrSlug: string,
  where?: FindPostByIdentifierArgs["where"],
) {
  return {
    OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    ...(where?.status ? { status: where.status } : {}),
    ...(where?.type ? { type: where.type } : {}),
  };
}

async function findPostByIdentifierWithLegacySelect({
  idOrSlug,
  where,
}: FindPostByIdentifierArgs) {
  const row = await prisma.post.findFirst({
    where: buildPostLookupWhere(idOrSlug, where),
    select: LEGACY_POST_SELECT,
  });

  if (!row) return null;

  return {
    ...row,
    title_id: null,
    content_id: null,
    author_name_id: null,
    author_role: null,
    author_role_id: null,
    author_bio: null,
    author_bio_id: null,
    tags: null,
    tags_id: null,
    category_id: null,
  };
}

export async function findPostByIdentifier({
  idOrSlug,
  where,
  legacySelect,
}: FindPostByIdentifierArgs) {
  const preferLegacy =
    legacySelect === true ||
    (legacySelect !== false && useLegacyPostSelect === true);

  if (preferLegacy) {
    return findPostByIdentifierWithLegacySelect({ idOrSlug, where });
  }

  try {
    const post = await prisma.post.findFirst({
      where: buildPostLookupWhere(idOrSlug, where),
    });
    useLegacyPostSelect = false;
    return post;
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    useLegacyPostSelect = true;
    return findPostByIdentifierWithLegacySelect({ idOrSlug, where });
  }
}

function stripExtendedFields<T extends Record<string, unknown>>(data: T) {
  const {
    title_id,
    content_id,
    author_name_id,
    author_role,
    author_role_id,
    author_bio,
    author_bio_id,
    tags,
    tags_id,
    category_id,
    ...legacy
  } = data;
  void title_id;
  void content_id;
  void author_name_id;
  void author_role;
  void author_role_id;
  void author_bio;
  void author_bio_id;
  void tags;
  void tags_id;
  void category_id;
  return legacy;
}

export async function createPost(data: Prisma.PostCreateInput) {
  if (useLegacyPostSelect) {
    return prisma.post.create({
      data: stripExtendedFields(data) as Prisma.PostCreateInput,
    });
  }

  try {
    const post = await prisma.post.create({ data });
    useLegacyPostSelect = false;
    return post;
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    useLegacyPostSelect = true;
    return prisma.post.create({
      data: stripExtendedFields(data) as Prisma.PostCreateInput,
    });
  }
}

export async function updatePost(id: string, data: Prisma.PostUpdateInput) {
  if (useLegacyPostSelect) {
    return prisma.post.update({
      where: { id },
      data: stripExtendedFields(data) as Prisma.PostUpdateInput,
    });
  }

  try {
    const post = await prisma.post.update({ where: { id }, data });
    useLegacyPostSelect = false;
    return post;
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    useLegacyPostSelect = true;
    return prisma.post.update({
      where: { id },
      data: stripExtendedFields(data) as Prisma.PostUpdateInput,
    });
  }
}
