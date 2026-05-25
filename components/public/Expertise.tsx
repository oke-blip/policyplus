"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PublicSectionHero } from "@/components/public/PublicSectionHero";
import { pickLocalized, type ContentLocale } from "@/lib/content-locale";
import { parseExpertiseItems, type ExpertiseItem } from "@/lib/settings-utils";
import { cn } from "@/lib/utils";

function pickSettingsField(
  raw: Record<string, unknown> | undefined,
  key: string,
  locale: ContentLocale,
  fallback: string,
): string {
  const en = typeof raw?.[key] === "string" ? raw[key] : undefined;
  const id = typeof raw?.[`${key}_id`] === "string" ? raw[`${key}_id`] : undefined;
  const picked = pickLocalized(locale, en as string | undefined, id as string | undefined);
  return picked.trim() || fallback;
}

function localizeExpertiseItems(items: ExpertiseItem[], locale: ContentLocale): ExpertiseItem[] {
  return items.map((item) => ({
    ...item,
    tag: pickLocalized(locale, item.tag, item.tag_id),
    title: pickLocalized(locale, item.title, item.title_id),
    desc: item.desc ? pickLocalized(locale, item.desc, item.desc_id) : undefined,
  }));
}

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

function getPreviewGridClass(count: number) {
  if (count <= 1) return "grid grid-cols-1 max-w-[320px] mx-auto";
  if (count === 2) return "grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto";
  if (count === 3) return "grid grid-cols-1 lg:grid-cols-3 max-w-5xl mx-auto";
  return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto";
}

function getFullGridClass(count: number) {
  if (count <= 1) return "grid grid-cols-1 max-w-2xl mx-auto";
  return "grid grid-cols-1 gap-8 md:grid-cols-2 max-w-7xl mx-auto";
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
  variant = "preview",
  showArrows = true,
}: {
  data?: Record<string, unknown>;
  initialItems?: ExpertiseItem[];
  /** `preview` = homepage sticky stack; `full` = dedicated page with hero + expanded grid */
  variant?: "preview" | "full";
  showArrows?: boolean;
}) {
  const isFullPage = variant === "full";
  const { t, locale } = useLanguage();
  const [fetchedItems, setFetchedItems] = useState<ExpertiseItem[]>([]);

  const header = pickSettingsField(data, "expertise_header", locale, String(t("expertise.header")));
  const description = pickSettingsField(
    data,
    "expertise_description",
    locale,
    String(t("expertise.description")),
  );

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
  const rawItems =
    cmsItems.length > 0 ? cmsItems : fetchedItems.length > 0 ? fetchedItems : null;
  const items = useMemo(
    () =>
      rawItems ? localizeExpertiseItems(rawItems, locale) : fallbackItems,
    [rawItems, locale, fallbackItems],
  );
  const count = items.length;
  const countLabel = String(t("expertise.page.countLabel")).replace("{count}", String(count));

  return (
    <section
      id="expertise"
      className={
        isFullPage
          ? "relative w-full bg-black pt-28 pb-20 text-white lg:pt-32 lg:pb-28"
          : "relative h-auto min-h-svh w-full snap-start bg-black pt-28 pb-32 text-white lg:pt-32"
      }
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-[-5%] -z-10 h-[50vh] w-[40vw] rounded-full bg-yellow-500/5 blur-[120px]"
      />
      <motion.div
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-7xl flex-col font-sans",
          isFullPage ? "px-4 sm:px-6 lg:px-8" : "px-4",
        )}
      >
        {isFullPage ? (
          <PublicSectionHero title={header} description={description}>
            {count > 0 ? (
              <p className="text-sm font-medium text-zinc-500">{countLabel}</p>
            ) : null}
          </PublicSectionHero>
        ) : (
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
        )}

        {count === 0 ? (
          <div className="mt-20 text-center text-slate-500">
            <p>Belum ada data expertise yang ditambahkan.</p>
          </div>
        ) : (
          <motion.div
            className={cn(
              "group/grid relative mx-auto w-full",
              isFullPage
                ? cn("gap-8", getFullGridClass(count))
                : cn("mt-12 gap-6 px-4 lg:mt-16 lg:px-0", getPreviewGridClass(count)),
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
                    "group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-white/5 shadow-2xl transition-colors duration-300",
                    isFullPage
                      ? "min-h-[520px] bg-[#0a0a0c] text-white hover:border-yellow-500/30 lg:flex-row"
                      : cn(
                          "sticky h-[440px] bg-[#111] text-white hover:bg-yellow-500 hover:text-black lg:static lg:h-[480px] lg:top-auto",
                        ),
                  )}
                  style={isFullPage ? undefined : { top: `${stickyTop}px` }}
                >
                  {isFullPage ? (
                    <div className="relative h-56 w-full shrink-0 overflow-hidden lg:h-auto lg:w-[44%] lg:min-h-[520px]">
                      <CardImage src={imageSrc} alt={item.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:bg-gradient-to-r" />
                      <span className="absolute left-6 top-6 rounded-full bg-yellow-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black">
                        {item.tag}
                      </span>
                    </div>
                  ) : null}

                  <div
                    className={cn(
                      "relative flex flex-1 flex-col",
                      isFullPage ? "justify-center p-8 lg:p-10" : "overflow-hidden p-6 lg:p-8",
                    )}
                  >
                    {!isFullPage ? (
                      <div className="pr-12">
                        <p className="mb-3 shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] opacity-70">
                          {item.tag}
                        </p>
                        <h3 className="line-clamp-3 shrink-0 text-xl font-bold leading-snug lg:text-2xl">
                          {item.title}
                        </h3>
                        {item.desc ? (
                          <p className="mt-3 line-clamp-3 text-sm leading-relaxed opacity-80">
                            {item.desc}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-yellow-500 lg:hidden">
                          {item.tag}
                        </p>
                        <h3 className="text-2xl font-bold leading-snug text-white lg:text-3xl">
                          {item.title}
                        </h3>
                        {item.desc ? (
                          <p className="mt-5 text-base leading-relaxed text-zinc-400">
                            {item.desc}
                          </p>
                        ) : null}
                      </>
                    )}

                    {showArrows ? (
                      <div
                        aria-hidden
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-current opacity-50 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1",
                          isFullPage ? "mt-8 w-fit px-1" : "absolute top-6 right-6",
                        )}
                      >
                        <ArrowUpRight size={18} strokeWidth={2.5} />
                      </div>
                    ) : null}
                  </div>

                  {!isFullPage ? (
                    <div className="relative mt-auto aspect-video w-full shrink-0">
                      <CardImage src={imageSrc} alt={item.title} />
                    </div>
                  ) : null}
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}