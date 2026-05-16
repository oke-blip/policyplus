"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Link2 as Linkedin, Copy, Check, Loader } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickLocalized, type ContentLocale } from "@/lib/content-locale";

type InsightPost = {
  id?: string;
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
  tags?: string | null;
  tags_id?: string | null;
  category?: string | null;
  category_id?: string | null;
  createdAt?: string;
  date?: string;
};

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978 1.602 0 2.703.095 2.703.095v3.386h-1.603c-1.54 0-2.127.53-2.127 1.53v2.547h3.92l-.643 3.667h-3.277v7.98H9.101z" />
    </svg>
  );
}

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
  } catch { /* fallback */ }
  return dateStr;
}

function mapLocalizedArticle(
  article: InsightPost,
  locale: ContentLocale,
  labels: { generalCategory: string; defaultAuthor: string },
) {
  const displayTitle = pickLocalized(locale, article.title, article.title_id);
  const displayContent = pickLocalized(locale, article.content, article.content_id);
  const displayCategory = pickLocalized(locale, article.category, article.category_id) || labels.generalCategory;
  const displayAuthorName = pickLocalized(locale, article.author_name, article.author_name_id);
  const displayAuthorRole = pickLocalized(locale, article.author_role, article.author_role_id);
  const displayAuthorBio = pickLocalized(locale, article.author_bio, article.author_bio_id);
  const tagsSource = pickLocalized(locale, article.tags, article.tags_id);
  const tagsArray = tagsSource ? tagsSource.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return {
    displayTitle,
    displayContent,
    displayCategory,
    displayAuthorName,
    displayAuthorRole,
    displayAuthorBio,
    tagsArray,
    formattedDate: formatArticleDate(article.createdAt || article.date, locale),
  };
}

export function InsightDetailPage({ id }: { id: string }) {
  const { t, locale } = useLanguage();
  const [article, setArticle] = useState<InsightPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const labels = useMemo(() => ({
    generalCategory: t<string>("insights.detail.generalCategory") || "General",
    defaultAuthor: t<string>("insights.detail.defaultAuthor") || "Policy+ Team",
  }), [t]);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/posts/${encodeURIComponent(id)}?type=INSIGHT&t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setArticle(data);
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchArticle();
  }, [id]);

  const localized = useMemo(() => (article ? mapLocalizedArticle(article, locale, labels) : null), [article, locale, labels]);

  const handleShare = (platform: 'linkedin' | 'facebook') => {
    const url = window.location.href;
    const shareUrls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black">
      <Loader className="animate-spin text-yellow-500" size={40} />
    </div>
  );

  if (!article || !localized) return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black text-white px-6 text-center">
      <h1 className="text-4xl font-bold mb-4">{t<string>("insights.detail.notFoundTitle") || "Article Not Found"}</h1>
      <Link href="/insights" className="text-yellow-500 underline underline-offset-4">
        {t<string>("insights.detail.back") || "Back to Insights"}
      </Link>
    </div>
  );

  const { displayTitle, displayContent, displayCategory, displayAuthorName, displayAuthorRole, displayAuthorBio, tagsArray, formattedDate } = localized;

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sans overflow-x-hidden selection:bg-yellow-500 selection:text-black">
      <div aria-hidden="true" className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[50vh] w-[70vw] -translate-x-1/2 rounded-full bg-yellow-500/[0.03] blur-[150px]" />

      <div className="mx-auto max-w-4xl px-4 pt-32 pb-24 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <Link href="/insights" className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition-colors hover:text-yellow-500">
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            {t<string>("insights.detail.back") || "Back to Insights"}
          </Link>
        </motion.div>

        <header className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="rounded-full bg-yellow-500 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-black shadow-lg shadow-yellow-500/10">
              {displayCategory}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            {displayTitle}
          </motion.h1>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center gap-6 border-b border-white/10 pb-8 pt-2 text-sm text-gray-400">
            {/* Hanya tampilkan jika ada nama penulis */}
            {displayAuthorName && (
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                  {article.author_image ? (
                    <Image src={article.author_image} alt={displayAuthorName} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-yellow-500 bg-yellow-500/10 uppercase">
                      {displayAuthorName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white leading-none">{displayAuthorName}</p>
                  {displayAuthorRole && <p className="text-xs text-gray-500 mt-1">{displayAuthorRole}</p>}
                </div>
              </div>
            )}
            <div className="hidden h-5 w-px bg-white/10 sm:block" />
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-gray-500" /><span>{formattedDate}</span></div>
              <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-500" /><span>{t<string>("insights.detail.minRead") || "5 min read"}</span></div>
            </div>
          </motion.div>
        </header>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.25 }} className="relative mt-8 w-full aspect-video overflow-hidden rounded-[2.5rem] border border-white/5 shadow-2xl bg-zinc-900">
          {article.image_url && <Image src={article.image_url} alt={displayTitle} fill priority className="object-cover" sizes="(max-width: 1200px) 100vw, 1200px" />}
        </motion.div>

        <div className="relative mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_48px]">
          <article className="min-w-0">
            <div 
              className="font-sans text-base leading-relaxed text-gray-300 sm:text-lg [&>p]:mb-6 [&>h1]:mt-8 [&>h1]:mb-4 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-white [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:border-l-4 [&>h2]:border-yellow-500 [&>h2]:pl-4 [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>blockquote]:relative [&>blockquote]:my-8 [&>blockquote]:rounded-2xl [&>blockquote]:border [&>blockquote]:border-white/5 [&>blockquote]:bg-white/[0.02] [&>blockquote]:p-6 md:[&>blockquote]:p-8 [&>blockquote]:text-xl [&>blockquote]:font-medium [&>blockquote]:italic [&>blockquote]:text-yellow-500 [&>blockquote]:leading-snug [&>ul]:mb-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2 [&>ol]:mb-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol>li]:mb-2 [&>a]:text-yellow-500 [&>a]:underline [&>a]:underline-offset-4 hover:[&>a]:text-yellow-400 [&>img]:rounded-xl [&>img]:my-6"
              dangerouslySetInnerHTML={{ __html: displayContent }} 
            />

            {tagsArray.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-8 mt-8 border-t border-white/10">
                {tagsArray.map((tag: string) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-300 transition-colors hover:border-yellow-500/40 hover:text-yellow-500">#{tag}</span>
                ))}
              </div>
            )}

            {/* BIO BOX HANDLING: Hanya muncul jika ada minimal Nama Penulis */}
            {displayAuthorName && (
              <div className="mt-12 flex flex-col gap-4 rounded-3xl border border-white/5 bg-gradient-to-br from-[#111] to-[#0a0a0c] p-6 sm:flex-row sm:items-start sm:p-8 shadow-xl">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                  {article.author_image ? (
                    <Image src={article.author_image} alt={displayAuthorName} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-xl text-yellow-500 bg-yellow-500/10 uppercase">
                      {displayAuthorName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white">{t<string>("insights.detail.writtenBy") || "Written by"} {displayAuthorName}</h4>
                  {displayAuthorBio && <p className="text-sm leading-relaxed text-gray-400">{displayAuthorBio}</p>}
                </div>
              </div>
            )}
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-28 flex flex-col items-center gap-3">
              <button onClick={() => handleShare('linkedin')} title="Share to LinkedIn" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#111] text-gray-400 transition hover:border-yellow-500 hover:text-yellow-500">
                <Linkedin size={16} />
              </button>
              <button onClick={() => handleShare('facebook')} title="Share to Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#111] text-gray-400 transition hover:border-yellow-500 hover:text-yellow-500">
                <FacebookIcon className="h-4 w-4" />
              </button>
              <div className="my-1 h-px w-6 bg-white/10" />
              <button onClick={handleCopyLink} title="Copy Link" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#111] text-gray-400 transition hover:border-yellow-500 hover:text-yellow-500">
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                <AnimatePresence>
                  {copied && (
                    <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -left-20 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded">
                      Copied!
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}