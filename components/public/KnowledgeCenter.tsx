"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface KnowledgeArticle {
  id: string;
  category: string;
  title: string;
  preview: string;
  image: string;
}

const HIDDEN_SCROLLBAR_STYLE: React.CSSProperties = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

export function KnowledgeCenterSection({ data }: { data?: any }) {
  const { t } = useLanguage();
  const [categories, setCategories] = React.useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = React.useState<string | null>(null);

  const [articles, setArticles] = React.useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch categories
      const catRes = await fetch("/api/categories");
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }

      // Fetch articles
      const res = await fetch(`/api/posts?type=KNOWLEDGE&t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const dbPosts = await res.json();
        
        if (dbPosts.length > 0) {
          setArticles(dbPosts.map((p: any) => ({
            id: p.id,
            title: p.title,
            preview: p.content,
            image: p.image_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200",
            category: p.category || "General" 
          })));
        } else {
          const payload = t<any[]>("knowledge.items");
          setArticles(payload);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      const payload = t<any[]>("knowledge.items");
      setArticles(payload);
    } finally {
      setLoading(false);
    }
  };

  const activeFilter = selectedFilter || "All";
  const displayFilters = ["All", ...categories.map(c => c.name)];

  const filteredArticles = (() => {
    if (activeFilter === "All") return articles;
    return articles.filter((item) => item.category === activeFilter);
  })();

  const visibleArticles = filteredArticles.slice(0, 3);

  return (
    <section id="knowledge" className="relative isolate flex min-h-svh w-full snap-start flex-col bg-black pt-44 pb-12 lg:pt-32 lg:pb-16">
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

        <div className="mx-auto mt-8 flex max-w-7xl gap-2 overflow-x-auto pb-2 hide-scrollbar" style={HIDDEN_SCROLLBAR_STYLE}>
          {displayFilters.map((label) => {
            const isActive = activeFilter === label;
            return (
              <button key={label} type="button" onClick={() => setSelectedFilter(label)} className={cn("shrink-0 rounded-full border px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors duration-300 sm:text-sm", isActive ? "border-yellow-500 bg-yellow-500 text-black" : "border-gray-800 bg-[#111] text-gray-400 hover:text-gray-200")}>
                {label}
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-12 grid w-full grid-cols-1 gap-8 pb-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-96 bg-zinc-900 animate-pulse rounded-[2.5rem]" />
              ))
            ) : (
              visibleArticles.map((item) => (
                <motion.article key={item.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }} className="group relative flex min-h-[400px] cursor-pointer flex-col overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0a0a0c] shadow-2xl transition-all duration-300 hover:border-yellow-500/20">
                  <div className="absolute inset-0">
                    <img src={item.image} alt="" className="h-full w-full object-cover opacity-60 transition-transform duration-1000 lg:group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  </div>
                  <div className="relative mt-auto flex flex-col p-8 transition-transform duration-500 ease-out">
                    <div className="mb-4 flex">
                       <span className="rounded-full bg-yellow-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-black">{item.category}</span>
                    </div>
                    <h3 className="text-xl font-bold leading-tight text-white md:text-2xl">{item.title}</h3>
                    <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-gray-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">{item.preview}</p>
                  </div>
                </motion.article>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex shrink-0 justify-center">
          <Button asChild className="h-11 rounded-full border-0 bg-yellow-500 px-8 text-sm font-semibold text-black shadow-lg hover:bg-yellow-400">
            <Link href="/blog">{String(t("knowledge.cta"))}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
