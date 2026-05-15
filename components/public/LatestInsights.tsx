"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Loader } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function LatestInsights({ data }: { data?: any }) {
  const { t } = useLanguage();

  const header = data?.insights_header || t("insights.header") || "Latest Insights";
  const description = data?.insights_description || "";

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/posts?type=INSIGHT&limit=3&t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fallbackItems = t<any[]>("insights.items").slice(0, 3);
  const displayPosts = posts.length > 0 ? posts : fallbackItems;

  return (
    <section className="relative isolate flex min-h-svh w-full snap-start flex-col bg-black pt-28 pb-12 lg:pt-32 lg:pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-7%] bottom-[-10%] -z-10 h-[50vh] w-[48vw] rounded-full bg-yellow-500/5 blur-[100px]"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4">
        <h2 className="w-full text-center text-3xl font-bold text-white sm:text-4xl">
          {header}
        </h2>
        {description && (
          <p className="mt-4 text-center text-gray-400">{description}</p>
        )}

        <div className="mt-8 grid w-full grid-cols-1 gap-6 pb-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-96 bg-zinc-900 animate-pulse rounded-3xl" />
            ))
          ) : (
            displayPosts.map((post: any) => (
              <article
                key={post.id || post.title}
                className="group flex min-h-[360px] cursor-pointer flex-col overflow-hidden rounded-3xl border border-gray-800 bg-[#111] transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative h-44 w-full shrink-0 overflow-hidden sm:h-48 lg:h-44">
                  <Image
                    src={post.image_url || post.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1500"}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-800 border border-white/10">
                      {post.author_image ? (
                        <Image src={post.author_image} alt={post.author_name} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-yellow-500 bg-yellow-500/10 uppercase">
                          {post.author_name?.charAt(0) || "P"}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{post.author_name || "PolicyPlus Team"}</span>
                      <span className="text-[10px] text-gray-500">{post.date || new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <h3 className="mb-2 line-clamp-2 text-lg leading-snug font-bold text-white lg:text-xl">
                    {post.title}
                  </h3>
                  <div 
                    className="mb-5 line-clamp-3 text-sm text-gray-400 prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  <span className="mt-auto flex w-max items-center gap-2 border-b border-transparent pb-0.5 text-sm font-semibold text-white transition-colors group-hover:border-yellow-500 group-hover:text-yellow-500">
                    {t("insights.readMore") || "Read More"}
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                  </span>
                </div>
              </article>
            ))
          )}
        </div>

        <button
          type="button"
          className="mx-auto mt-4 flex shrink-0 items-center gap-3 rounded-full bg-yellow-500 px-6 py-3 font-bold text-black transition-colors hover:bg-yellow-400 lg:mt-6"
        >
          {t("insights.readAll") || "Read All Insights"}
          <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
        </button>
      </div>
    </section>
  );
}
