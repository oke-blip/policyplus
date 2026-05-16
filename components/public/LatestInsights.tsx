"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Newspaper, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
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

function formatInsightDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
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
    date: post.date || formatInsightDate(post.createdAt),
    href: insightDetailHref(post),
  };
}

export function LatestInsights({ data }: { data?: Record<string, unknown> }) {
  const { t, locale } = useLanguage();

  const header =
    (data?.insights_header as string) ||
    t("insights.header") ||
    "Latest Insights";

  const [posts, setPosts] = useState<InsightPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      try {
        setError(false);
        const res = await fetch(
          `/api/posts?type=INSIGHT&limit=3&t=${Date.now()}`,
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
  }, []);

  const displayPosts = useMemo(
    () => posts.map((post) => normalizePost(post, locale)),
    [posts, locale]
  );

  const readMoreLabel = t("insights.readMore") || "Read More";
  const readAllLabel = t("insights.readAll") || "Read All Insights";

  return (
    <section
      id="insights"
      className="relative isolate flex min-h-svh w-full snap-start flex-col justify-center bg-black pt-28 pb-16 lg:pt-32 lg:pb-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 left-1/2 -z-10 h-[40vh] w-[50vw] -translate-x-1/2 rounded-full bg-yellow-500/[0.03] blur-[120px]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6">
        <h2 className="text-center text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {header}
        </h2>

        {loading ? (
          <div className="mt-10 grid w-full grid-cols-1 gap-6 sm:mt-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex h-[460px] flex-col overflow-hidden rounded-[2rem] border border-white/5 bg-[#111]"
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
        ) : (
          <div className="mt-10 grid w-full grid-cols-1 gap-6 sm:mt-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {displayPosts.map((post) => (
              <article
                key={post.id}
                className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#111] transition-all duration-300 hover:-translate-y-2 hover:border-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/5"
              >
                <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-slate-800">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <div className="mb-4 flex items-center gap-3 text-xs text-gray-400">
                    <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-zinc-800 border border-white/10">
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
                          <span>{post.date}</span>
                        </>
                      )}
                    </p>
                  </div>

                  <h3 className="mb-3 line-clamp-3 text-xl font-bold leading-snug text-white lg:text-2xl">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-zinc-400">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="mt-auto pt-2">
                    <Link
                      href={post.href}
                      className="inline-flex items-center text-sm font-bold text-yellow-500 underline decoration-2 underline-offset-4 transition-colors hover:text-yellow-400"
                    >
                      {readMoreLabel}
                      <ArrowRight
                        className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden
                      />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
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