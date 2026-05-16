import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KnowledgeDetailPage } from "@/components/public/KnowledgeDetailPage";
import { getKnowledgeDetailProps } from "@/lib/knowledge-article";
import { pickLocalized, type ContentLocale } from "@/lib/content-locale";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

function toContentLocale(locale: string): ContentLocale {
  return locale === "id" ? "id" : "en";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const props = await getKnowledgeDetailProps(slug);
  if (!props) {
    return { title: "Article Not Found | Policy+" };
  }

  const contentLocale = toContentLocale(locale);
  const title = pickLocalized(
    contentLocale,
    props.article.title,
    props.article.title_id,
  );

  return {
    title: `${title} | Policy+`,
    description: pickLocalized(
      contentLocale,
      props.article.content,
      props.article.content_id,
    ).replace(/<[^>]+>/g, " ").slice(0, 160),
  };
}

export default async function KnowledgeArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const props = await getKnowledgeDetailProps(slug);

  if (!props) {
    notFound();
  }

  return (
    <KnowledgeDetailPage article={props.article} relatedPosts={props.relatedPosts} />
  );
}
