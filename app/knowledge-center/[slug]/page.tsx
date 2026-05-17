import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { KnowledgeDetailPage } from "@/components/public/KnowledgeDetailPage";
import { getKnowledgeDetailProps } from "@/lib/knowledge-article";
import { pickLocalized } from "@/lib/content-locale";
import { getServerContentLocale } from "@/lib/get-server-content-locale";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const props = await getKnowledgeDetailProps(slug);
  if (!props) {
    return { title: "Article Not Found | Policy+" };
  }

  const locale = await getServerContentLocale();
  const title = pickLocalized(locale, props.article.title, props.article.title_id);

  return {
    title: `${title} | Policy+`,
    description: pickLocalized(locale, props.article.content, props.article.content_id)
      .replace(/<[^>]+>/g, " ")
      .slice(0, 160),
  };
}

export default async function KnowledgeArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const props = await getKnowledgeDetailProps(slug);

  if (!props) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <KnowledgeDetailPage article={props.article} relatedPosts={props.relatedPosts} />
    </>
  );
}
