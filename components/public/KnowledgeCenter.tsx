"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Library } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { pickLocalized } from "@/lib/content-locale";
import { stripHtml } from "@/lib/strip-html";

export interface KnowledgeArticle {
  id: string;
  slug: string;
  category: string;
  title: string;
  preview: string;
  image: string;
}

const MAX_ITEMS = 3;

function mapPostToArticle(
  p: {
    id: string;
    slug?: string;
    title: string;
    title_id?: string | null;
    content: string;
    content_id?: string | null;
    image_url?: string | null;
    category?: string | null;
    category_id?: string | null;
  },
  locale: "en" | "id"
): KnowledgeArticle {
  const displayTitle = pickLocalized(locale, p.title, p.title_id);
  const displayContent = pickLocalized(locale, p.content, p.content_id);
  return {
    id: p.id,
    slug: p.slug || p.id,
    title: displayTitle,
    preview: stripHtml(displayContent),
    image:
      p.image_url ||
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200",
    category: pickLocalized(locale, p.category, p.category_id) || "General",
  };
}

export function KnowledgeCenterSection({ data }: { data?: any }) {
  const { t, locale } = useLanguage();
  const [rawPosts, setRawPosts] = React.useState<Parameters<typeof mapPostToArticle>[0][]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(
          `/api/posts?type=KNOWLEDGE&limit=${MAX_ITEMS}&t=${Date.now()}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const dbPosts = await res.json();
          if (!cancelled) {
            setRawPosts(dbPosts);
          }
        } else {
          if (!cancelled) setError(true);
        }
      } catch (err) {
        console.error("Error fetching knowledge data:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const articles = React.useMemo(
    () => rawPosts.map((p) => mapPostToArticle(p, locale)),
    [rawPosts, locale]
  );

  return (
    <section id="knowledge" className="relative isolate flex min-h-svh w-full snap-start flex-col justify-center bg-black pt-28 pb-12 lg:pt-32 lg:pb-16">
      <div aria-hidden="true" className="pointer-events-none absolute top-[20%] right-[-10%] -z-10 h-[60vh] w-[40vw] rounded-full bg-yellow-500/5 blur-[120px]" />
      
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4">
        <header className="mx-auto max-w-3xl shrink-0 text-center">
          <h2 className="font-sans text-xl font-bold uppercase tracking-wide text-white sm:text-2xl md:text-3xl">
            {t("knowledge.header")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-400 sm:mt-4 sm:text-base">
            {t("knowledge.description")}
          </p>
        </header>

        <div className="mx-auto w-full pb-12">
          {loading ? (
            <div className="mt-12 grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
              {Array(MAX_ITEMS).fill(0).map((_, i) => (
                <div key={i} className="h-[400px] animate-pulse rounded-[2.5rem] bg-zinc-900 border border-white/5" />
              ))}
            </div>
          ) : error ? (
            <div className="mt-16 flex flex-col items-center justify-center text-center p-12 rounded-[2rem] border border-white/5 bg-[#111] max-w-xl mx-auto shadow-2xl">
              <AlertCircle className="text-rose-500/50 size-12 mb-5" />
              <p className="text-lg font-bold text-white mb-2">Service Temporarily Unavailable</p>
              <p className="text-sm text-gray-400">
                We are having trouble connecting to the Knowledge Center. Please check your connection or try again later.
              </p>
            </div>
          ) : rawPosts.length === 0 ? (
            <div className="mt-16 flex flex-col items-center justify-center text-center p-12 rounded-[2rem] border border-white/5 bg-[#111] max-w-xl mx-auto shadow-2xl">
              <Library className="text-yellow-500/30 size-12 mb-5" />
              <p className="text-lg font-bold text-white mb-2">Knowledge Base Coming Soon</p>
              <p className="text-sm text-gray-400">
                Our team is actively curating comprehensive reports and policy guidelines. They will appear here once published.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {articles.map((item) => (
                  <Link key={item.id} href={`/knowledge-center/${item.slug}`} className="block">
                    <motion.article
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25 }}
                      className="group relative flex min-h-[400px] cursor-pointer flex-col overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0a0a0c] shadow-2xl transition-all duration-300 hover:border-yellow-500/30 hover:-translate-y-2"
                    >
                      <div className="absolute inset-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover opacity-60 transition-transform duration-1000 lg:group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      </div>
                      
                      <div className="relative mt-auto flex flex-col p-8 transition-transform duration-500 ease-out">
                        <div className="mb-4 flex">
                          <span className="rounded-full bg-yellow-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-black">
                            {item.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold leading-tight text-white md:text-2xl line-clamp-3">
                          {item.title}
                        </h3>
                        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-gray-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          {item.preview}
                        </p>
                      </div>
                    </motion.article>
                  </Link>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {!loading && !error && rawPosts.length > 0 && (
          <div className="mt-4 flex shrink-0 justify-center">
            <Button asChild className="h-11 rounded-full border-0 bg-yellow-500 px-8 text-sm font-bold text-black shadow-lg transition-transform duration-300 hover:bg-yellow-400 hover:scale-105">
              <Link href="/blog">{String(t("knowledge.cta"))}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}