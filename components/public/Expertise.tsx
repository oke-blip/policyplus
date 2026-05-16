"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react"; // <-- Import icon panah
import { useLanguage } from "@/contexts/LanguageContext";
import { parseExpertiseItems, type ExpertiseItem } from "@/lib/settings-utils";
import { cn } from "@/lib/utils";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200",
] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// Logika grid diperbaiki agar rata tengah jika data cuma 1
function getGridClass(count: number) {
  if (count <= 1) return "grid grid-cols-1 max-w-[320px] mx-auto";
  if (count === 2) return "grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto";
  if (count === 3) return "grid grid-cols-1 lg:grid-cols-3 max-w-5xl mx-auto";
  return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto";
}

function CardImage({ src, alt }: { src: string; alt: string }) {
  if (src.startsWith("data:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="absolute inset-0 h-full w-full object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
    />
  );
}

export function ExpertiseSection({
  data,
  initialItems,
}: {
  data?: Record<string, unknown>;
  initialItems?: ExpertiseItem[];
}) {
  const { t } = useLanguage();
  const [fetchedItems, setFetchedItems] = useState<ExpertiseItem[]>([]);

  const header = String(data?.expertise_header || t("expertise.header"));
  const description = String(data?.expertise_description || t("expertise.description"));

  const cmsItems = useMemo(() => {
    if (initialItems?.length) return initialItems;
    return parseExpertiseItems(data?.expertise_items);
  }, [initialItems, data?.expertise_items]);

  useEffect(() => {
    if (cmsItems.length > 0) return;

    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((settings) => {
        const fromApi = parseExpertiseItems(settings.expertise_items);
        if (fromApi.length > 0) setFetchedItems(fromApi);
      })
      .catch(() => {});
  }, [cmsItems.length]);

  const fallbackItems = t<ExpertiseItem[]>("expertise.items");
  const items =
    cmsItems.length > 0 ? cmsItems : fetchedItems.length > 0 ? fetchedItems : fallbackItems;
  const count = items.length;

  return (
    <section
      id="expertise"
      className="relative h-auto min-h-svh w-full snap-start bg-black pt-28 pb-32 text-white lg:pt-32"
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-[-5%] -z-10 h-[50vh] w-[40vw] rounded-full bg-yellow-500/5 blur-[120px]"
      />
      <motion.div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 font-sans">
        <motion.header
          className="shrink-0 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-[10px] font-semibold tracking-[0.25em] text-gray-500 uppercase sm:text-xs">
            {header}
          </p>
          <p className="mx-auto mt-2 max-w-3xl text-balance text-sm leading-relaxed text-gray-300 sm:mt-3 sm:text-base md:text-lg">
            {description}
          </p>
        </motion.header>

        {/* Handling khusus jika data 0 */}
        {count === 0 ? (
          <div className="mt-20 text-center text-slate-500">
            <p>Belum ada data expertise yang ditambahkan.</p>
          </div>
        ) : (
          <motion.div
            className={cn(
              "group/grid relative mx-auto mt-12 w-full gap-6 px-4 lg:mt-16 lg:px-0",
              getGridClass(count)
            )}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {items.map((item, index) => {
              const imageSrc =
                item.image || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
              const stickyTop = 100 + index * 20;

              return (
                <motion.article
                  key={`${item.id ?? item.title}-${index}`}
                  variants={cardVariants}
                  className={cn(
                    "group relative sticky flex h-[440px] flex-col overflow-hidden rounded-[2.5rem] border border-white/5 shadow-2xl transition-colors duration-300 lg:static lg:h-[480px]",
                    "bg-[#111] text-white hover:bg-yellow-500 hover:text-black",
                    "lg:top-auto"
                  )}
                  style={{ top: `${stickyTop}px` }}
                >
                  {/* Wrapper konten text dikasih overflow-hidden biar ngga tumpah */}
                  <motion.div className="relative flex flex-1 flex-col overflow-hidden p-6 lg:p-8">
                    <div className="pr-12">
                      <p className="mb-3 shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] opacity-70">
                        {item.tag}
                      </p>
                      {/* line-clamp-3 membatasi judul maksimal 3 baris */}
                      <h3 className="shrink-0 text-xl font-bold leading-snug line-clamp-3 lg:text-2xl">
                        {item.title}
                      </h3>
                      {item.desc ? (
                        /* line-clamp-3 membatasi deskripsi maksimal 3 baris */
                        <p className="mt-3 text-sm leading-relaxed opacity-80 line-clamp-3">
                          {item.desc}
                        </p>
                      ) : null}
                    </div>

                    {/* Ikon panah yang rapi di pojok */}
                    <div
                      aria-hidden
                      className="absolute top-6 right-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-current opacity-50 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                    >
                      <ArrowUpRight size={18} strokeWidth={2.5} />
                    </div>
                  </motion.div>

                  {/* Wrapper gambar diganti jadi aspect-video (16:9) yang di-shrink-0 (gak bisa kegencet) */}
                  <div className="relative mt-auto w-full shrink-0 aspect-video">
                    <CardImage src={imageSrc} alt={item.title} />
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}