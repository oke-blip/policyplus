"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickLocalized, type ContentLocale } from "@/lib/content-locale";
import { stripHtml } from "@/lib/strip-html";
import { ReadingProgressBar } from "@/components/public/ReadingProgressBar";
import type { KnowledgePostRecord } from "@/lib/knowledge-article";

export type { KnowledgePostRecord };

function formatArticleDate(dateStr: string | undefined, locale: ContentLocale): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(date);
    }
  } catch {
    // raw fallback
  }
  return dateStr;
}

function mapLocalizedArticle(
  article: KnowledgePostRecord,
  locale: ContentLocale,
  labels: { generalCategory: string; defaultAuthor: string },
) {
  const displayTitle = pickLocalized(locale, article.title, article.title_id);
  const displayContent = pickLocalized(locale, article.content, article.content_id);
  const displayCategory =
    pickLocalized(locale, article.category, article.category_id) || labels.generalCategory;
  const displayAuthorName =
    pickLocalized(locale, article.author_name, article.author_name_id) || labels.defaultAuthor;
  const displayAuthorRole = pickLocalized(locale, article.author_role, article.author_role_id);
  const displayAuthorBio = pickLocalized(locale, article.author_bio, article.author_bio_id);

  return {
    displayTitle,
    displayContent,
    displayCategory,
    displayAuthorName,
    displayAuthorRole,
    displayAuthorBio,
    formattedDate: formatArticleDate(article.createdAt, locale),
  };
}

function mapRelatedCard(
  post: KnowledgePostRecord,
  locale: ContentLocale,
  generalCategory: string,
) {
  const title = pickLocalized(locale, post.title, post.title_id);
  const content = pickLocalized(locale, post.content, post.content_id);
  const category = pickLocalized(locale, post.category, post.category_id) || generalCategory;
  return {
    id: post.id,
    slug: post.slug,
    title,
    preview: stripHtml(content).slice(0, 140),
    category,
    image:
      post.image_url ||
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200",
  };
}

const articleProseClass =
  "prose prose-invert prose-yellow lg:prose-xl max-w-none " +
  "prose-headings:text-white prose-headings:font-bold " +
  "prose-p:text-gray-300 prose-li:text-gray-300 " +
  "prose-a:text-yellow-500 prose-a:no-underline hover:prose-a:text-yellow-400 " +
  "prose-blockquote:not-italic prose-blockquote:border-0 prose-blockquote:border-l-[6px] " +
  "prose-blockquote:border-yellow-500 prose-blockquote:bg-white/[0.02] " +
  "prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl " +
  "prose-blockquote:text-yellow-100/90 prose-blockquote:font-medium " +
  "prose-img:rounded-3xl prose-img:my-8 " +
  "prose-figure:my-10 prose-figcaption:mt-3 prose-figcaption:text-center " +
  "prose-figcaption:text-sm prose-figcaption:text-gray-500 prose-figcaption:not-italic";

export function KnowledgeDetailPage({
  article,
  relatedPosts,
}: {
  article: KnowledgePostRecord;
  relatedPosts: KnowledgePostRecord[];
}) {
  const { t, locale } = useLanguage();

  const labels = useMemo(
    () => ({
      generalCategory:
        t<string>("knowledge.detail.generalCategory") || "General",
      defaultAuthor:
        t<string>("knowledge.detail.defaultAuthor") || "Policy+ Team",
    }),
    [t],
  );

  const localized = useMemo(
    () => mapLocalizedArticle(article, locale, labels),
    [article, locale, labels],
  );

  const relatedCards = useMemo(
    () => relatedPosts.map((p) => mapRelatedCard(p, locale, labels.generalCategory)),
    [relatedPosts, locale, labels.generalCategory],
  );

  const backLabel = t<string>("knowledge.detail.back") || "Back to Library";
  const readNextLabel =
    t<string>("knowledge.detail.readNext") || "Read Next Analysis";

  const {
    displayTitle,
    displayContent,
    displayCategory,
    displayAuthorName,
    displayAuthorRole,
    displayAuthorBio,
    formattedDate,
  } = localized;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="relative min-h-screen w-full bg-black text-white font-sans overflow-x-hidden selection:bg-yellow-500 selection:text-black"
    >
      <ReadingProgressBar />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[45vh] w-[80vw] max-w-4xl -translate-x-1/2 rounded-full bg-yellow-500/[0.04] blur-[120px]"
      />

      <div className="mx-auto max-w-4xl px-4 pt-28 pb-24 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link
            href="/knowledge-center"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition-colors hover:text-yellow-500"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            {backLabel}
          </Link>
        </div>

        <header className="mx-auto max-w-4xl text-center space-y-6">
          <span className="inline-block rounded-full bg-yellow-500 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-black">
            {displayCategory}
          </span>

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[2.75rem]">
            {displayTitle}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-center gap-4 border-b border-white/10 pb-10 sm:flex-row sm:gap-8"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-900">
                {article.author_image ? (
                  <Image
                    src={article.author_image}
                    alt={displayAuthorName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold uppercase text-yellow-500 bg-yellow-500/10">
                    {displayAuthorName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className="font-semibold text-white leading-tight">{displayAuthorName}</p>
                {displayAuthorRole && (
                  <p className="text-xs text-gray-500 mt-0.5">{displayAuthorRole}</p>
                )}
              </div>
            </div>

            {formattedDate && (
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <Calendar className="h-4 w-4 text-gray-500" />
                <time dateTime={article.createdAt}>{formattedDate}</time>
              </div>
            )}
          </motion.div>
        </header>

        {article.image_url && (
          <div className="relative mx-auto mt-10 aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-3xl border border-white/5 bg-zinc-900 shadow-2xl">
            <Image
              src={article.image_url}
              alt={displayTitle}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        )}

        <article className="mx-auto mt-12 max-w-4xl">
          <div
            className={articleProseClass}
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />

          {displayAuthorBio && (
            <div className="mt-14 rounded-3xl border border-white/5 bg-white/[0.02] px-6 py-8 text-center sm:px-10">
              <p className="text-xs font-black uppercase tracking-widest text-yellow-500/80 mb-3">
                {displayAuthorName}
              </p>
              <p className="text-sm leading-relaxed text-gray-400 max-w-2xl mx-auto">
                {displayAuthorBio}
              </p>
            </div>
          )}
        </article>

        {relatedCards.length > 0 && (
          <section className="mt-20 border-t border-white/10 pt-14">
            <h2 className="text-center text-xs font-black uppercase tracking-[0.2em] text-yellow-500 mb-8">
              {readNextLabel}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {relatedCards.map((card) => (
                <Link
                  key={card.id}
                  href={`/knowledge-center/${card.slug || card.id}`}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0c] transition-all duration-300 hover:border-yellow-500/30 hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900">
                    <img
                      src={card.image}
                      alt=""
                      className="h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-yellow-500 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-black">
                      {card.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold leading-snug text-white line-clamp-3 group-hover:text-yellow-500 transition-colors">
                      {card.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-400">{card.preview}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-14 flex justify-center">
          <Link
            href="/knowledge-center"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-gray-300 transition-colors hover:border-yellow-500/40 hover:text-yellow-500"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
