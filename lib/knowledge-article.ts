import { findPostByIdentifier, findPosts } from "@/lib/post-db-compat";

export type KnowledgePostRecord = {
  id: string;
  slug: string;
  title: string;
  title_id?: string | null;
  content: string;
  content_id?: string | null;
  image_url?: string | null;
  author_name?: string | null;
  author_name_id?: string | null;
  author_role?: string | null;
  author_role_id?: string | null;
  author_bio?: string | null;
  author_bio_id?: string | null;
  author_image?: string | null;
  category?: string | null;
  category_id?: string | null;
  createdAt?: string;
};

export async function fetchKnowledgeArticle(slug: string) {
  return findPostByIdentifier({
    idOrSlug: decodeURIComponent(slug),
    where: { status: "PUBLISHED", type: "KNOWLEDGE" },
  });
}

export async function fetchRelatedKnowledgePosts(excludeId: string, take = 2) {
  const posts = await findPosts({
    where: { status: "PUBLISHED", type: "KNOWLEDGE" },
    take: 12,
  });
  return posts.filter((p) => p.id !== excludeId).slice(0, take);
}

export function serializeKnowledgePost(
  post: NonNullable<Awaited<ReturnType<typeof fetchKnowledgeArticle>>>,
): KnowledgePostRecord {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    title_id: post.title_id ?? null,
    content: post.content,
    content_id: post.content_id ?? null,
    image_url: post.image_url,
    author_name: post.author_name,
    author_name_id: post.author_name_id ?? null,
    author_role: post.author_role ?? null,
    author_role_id: post.author_role_id ?? null,
    author_bio: post.author_bio ?? null,
    author_bio_id: post.author_bio_id ?? null,
    author_image: post.author_image,
    category: post.category,
    category_id: post.category_id ?? null,
    createdAt:
      post.createdAt instanceof Date
        ? post.createdAt.toISOString()
        : String(post.createdAt ?? ""),
  };
}

export async function getKnowledgeDetailProps(slug: string) {
  const article = await fetchKnowledgeArticle(slug);
  if (!article) return null;
  const related = await fetchRelatedKnowledgePosts(article.id);
  return {
    article: serializeKnowledgePost(article),
    relatedPosts: related.map(serializeKnowledgePost),
  };
}
