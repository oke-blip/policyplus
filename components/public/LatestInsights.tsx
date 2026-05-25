"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Newspaper, AlertCircle, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";
import { resolveLatestInsightsHeader } from "@/lib/publications-section-settings";
import { stripHtml } from "@/lib/strip-html";

type InsightPost = {
  id?: string;
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  image_url?: string;
  image?: string;
  author_name?: string;
  author?: string;
  author_image?: string;
  date?: string;
  createdAt?: string;
};

function parseInsightTimestamp(dateStr?: string): number {
  if (!dateStr) return 0;
  const parsed = new Date(dateStr).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatInsightDate(dateStr?: string, locale: "en" | "id" = "en"): string {
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
    // use raw string
  }
  return dateStr;
}

function insightDetailHref(post: InsightPost): string {
  const segment = post.id ?? post.slug ?? post.title;
  return `/insights/${encodeURIComponent(segment)}`;
}

function normalizePost(
  post: InsightPost & {
    title_id?: string | null;
    content_id?: string | null;
    author_name_id?: string | null;
  },
  locale: "en" | "id"
) {
  const displayTitle =
    locale === "id" && post.title_id ? post.title_id : post.title;
  const contentSource =
    locale === "id" && post.content_id ? post.content_id : post.content;
  const excerpt =
    post.excerpt || (contentSource ? stripHtml(contentSource) : "");
  const id = post.id ?? post.slug ?? post.title;
  const authorEn = post.author_name || post.author || "Policy+ Team";
  const author =
    locale === "id" && post.author_name_id
      ? post.author_name_id
      : authorEn;
  return {
    id,
    title: displayTitle,
    excerpt,
    image:
      post.image_url ||
      post.image ||
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1500",
    author,
    authorImage: post.author_image,
    date: post.date || formatInsightDate(post.createdAt, locale),
    sortAt: parseInsightTimestamp(post.createdAt ?? post.date),
    href: insightDetailHref(post),
  };
}

export function LatestInsights({
  data,
  variant = "preview",
}: {
  data?: Record<string, unknown>;
  /** `preview` = homepage (3 posts + view all); `full` = dedicated listing page */
  variant?: "preview" | "full";
}) {
  const isFullPage = variant === "full";
  const fetchLimit = isFullPage ? undefined : 3;
  const { t, locale } = useLanguage();

  const sectionHeader = useMemo(
    () =>
      resolveLatestInsightsHeader(data, locale, {
        title: String(t("insights.header")) || "Latest Insights",
        subtitle: String(t("insights.page.description")),
      }),
    [data, locale, t],
  );

  const [posts, setPosts] = useState<InsightPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      try {
        setError(false);
        const limitQuery =
          fetchLimit != null ? `&limit=${fetchLimit}` : "";
        const res = await fetch(
          `/api/posts?type=INSIGHT${limitQuery}&t=${Date.now()}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setPosts(data);
        } else {
          if (!cancelled) setError(true);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPosts();
    return () => {
      cancelled = true;
    };
  }, [fetchLimit]);

  const displayPosts = useMemo(() => {
    const normalized = posts
      .map((post) => normalizePost(post, locale))
      .sort((a, b) => b.sortAt - a.sortAt);
    if (!isFullPage || !searchQuery.trim()) return normalized;
    const q = searchQuery.trim().toLowerCase();
    return normalized.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q),
    );
  }, [posts, locale, isFullPage, searchQuery]);

  const readMoreLabel = t("insights.readMore") || "Read More";
  const readAllLabel = t("insights.readAll") || "Read All Insights";
  const countLabel = String(t("insights.page.countLabel")).replace(
    "{count}",
    String(displayPosts.length),
  );
  const skeletonCount = isFullPage ? 4 : 3;
  const gridClass = isFullPage
    ? "mt-10 grid w-full grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10"
    : "mt-10 grid w-full grid-cols-1 gap-6 sm:mt-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-8";

  return (
    <section
      id="insights"
      className={
        isFullPage
          ? "relative isolate w-full bg-black pt-28 pb-20 lg:pt-32 lg:pb-28"
          : "relative isolate flex min-h-svh w-full snap-start flex-col justify-center bg-black pt-28 pb-16 lg:pt-32 lg:pb-20"
      }
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 left-1/2 -z-10 h-[40vh] w-[50vw] -translate-x-1/2 rounded-full bg-yellow-500/[0.03] blur-[120px]"
      />

      <div
        className={
          isFullPage
            ? "relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
            : "relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6"
        }
      >
        {isFullPage ? (
          <PublicSectionHero
            title={sectionHeader.title}
            description={sectionHeader.subtitle}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block w-full max-w-md">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                  aria-hidden
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={String(t("insights.page.searchPlaceholder"))}
                  className="w-full rounded-full border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-yellow-500/40 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                />
              </label>
              {!loading && !error && posts.length > 0 ? (
                <p className="shrink-0 text-sm font-medium text-zinc-500">{countLabel}</p>
              ) : null}
            </div>
          </PublicSectionHero>
        ) : (
          <h2 className="text-center text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {sectionHeader.title}
          </h2>
        )}

        {loading ? (
          <div className={gridClass}>
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div
                key={i}
                className={`flex flex-col overflow-hidden rounded-[2rem] border border-white/5 bg-[#111] ${
                  isFullPage ? "min-h-[420px]" : "h-[460px]"
                }`}
              >
                <div className="aspect-video w-full animate-pulse bg-white/[0.03]" />
                <div className="flex flex-1 flex-col p-6 sm:p-8 space-y-4">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-white/[0.03]" />
                  <div className="h-12 w-full animate-pulse rounded bg-white/[0.03]" />
                  <div className="h-16 w-full animate-pulse rounded bg-white/[0.03]" />
                  <div className="mt-auto h-4 w-20 animate-pulse rounded bg-white/[0.03]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-16 flex flex-col items-center justify-center text-center p-12 rounded-[2rem] border border-white/5 bg-[#111] max-w-xl mx-auto shadow-2xl">
            <AlertCircle className="text-rose-500/50 size-12 mb-5" />
            <p className="text-lg font-bold text-white mb-2">Oops! Something went wrong.</p>
            <p className="text-sm text-gray-400">
              We couldnt load the latest publications at this time. Please try refreshing the page later.
            </p>
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center text-center p-12 rounded-[2rem] border border-white/5 bg-[#111] max-w-xl mx-auto shadow-2xl">
            <Newspaper className="text-yellow-500/30 size-12 mb-5" />
            <p className="text-lg font-bold text-white mb-2">No publications yet</p>
            <p className="text-sm text-gray-400">
              Stay tuned! We are currently preparing fresh insights, research, and analysis. Check back soon.
            </p>
          </div>
        ) : displayPosts.length === 0 && isFullPage && searchQuery.trim() ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-[2rem] border border-white/5 bg-[#111] p-12 text-center">
            <Search className="mb-4 size-10 text-yellow-500/40" />
            <p className="text-lg font-bold text-white">No matches</p>
            <p className="mt-2 text-sm text-zinc-400">Try a different keyword or clear the search.</p>
          </div>
        ) : (
          <div className={gridClass}>
            {displayPosts.map((post, index) => (
              <Link
                key={post.id}
                href={post.href}
                className={
                  isFullPage
                    ? "group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0a0c] transition-all duration-300 hover:border-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 lg:flex-row lg:min-h-[280px]"
                    : "group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#111] transition-all duration-300 hover:-translate-y-2 hover:border-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
                }
              >
                <div
                  className={
                    isFullPage
                      ? "relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-800 lg:aspect-auto lg:h-auto lg:w-[42%]"
                      : "relative aspect-video w-full shrink-0 overflow-hidden bg-slate-800"
                  }
                >
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes={
                      isFullPage
                        ? "(max-width: 1024px) 100vw, 42vw"
                        : "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    }
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {isFullPage ? (
                    <span className="absolute left-6 top-6 text-5xl font-black text-white/10">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-8 lg:p-10">
                  <div className="mb-4 flex items-center gap-3 text-xs text-gray-400">
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                      {post.authorImage ? (
                        <Image
                          src={post.authorImage}
                          alt={post.author}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase text-yellow-500 bg-yellow-500/10">
                          {post.author.charAt(0)}
                        </div>
                      )}
                    </div>
                    <p className="truncate text-sm text-zinc-400">
                      <span className="font-semibold text-zinc-300">{post.author}</span>
                      {post.date && (
                        <>
                          <span className="mx-1.5">•</span>
                          <time dateTime={post.date}>{post.date}</time>
                        </>
                      )}
                    </p>
                  </div>

                  <h3
                    className={
                      isFullPage
                        ? "mb-4 text-2xl font-bold leading-snug text-white lg:text-3xl"
                        : "mb-3 line-clamp-3 text-xl font-bold leading-snug text-white lg:text-2xl"
                    }
                  >
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p
                      className={
                        isFullPage
                          ? "mb-6 line-clamp-4 text-base leading-relaxed text-zinc-400"
                          : "mb-6 line-clamp-3 text-sm leading-relaxed text-zinc-400"
                      }
                    >
                      {post.excerpt}
                    </p>
                  )}

                  <div className="mt-auto pt-2">
                    <span className="inline-flex items-center text-sm font-bold text-yellow-500 underline decoration-2 underline-offset-4 transition-colors group-hover:text-yellow-400">
                      {readMoreLabel}
                      <ArrowRight
                        className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isFullPage && !loading && !error && posts.length > 0 && (
          <Link
            href="/insights"
            className="group mx-auto mt-10 inline-flex items-center gap-2 rounded-full bg-yellow-500 px-8 py-3.5 text-sm font-bold text-black transition duration-300 hover:scale-105 hover:bg-yellow-400 sm:mt-12"
          >
            {readAllLabel}
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </Link>
        )}
      </div>
    </section>
  );
}