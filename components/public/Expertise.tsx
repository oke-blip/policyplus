"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type ExpertiseItem = {
  tag: string;
  title: string;
  desc: string;
};

const CARD_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200",
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

export function ExpertiseSection() {
  const { t } = useLanguage();
  const allItems = t<ExpertiseItem[]>("expertise.items");
  const items = allItems.slice(0, 3);

  return (
    <section
      id="expertise"
      className="relative h-auto min-h-svh w-full snap-start bg-black pt-28 pb-32 text-white lg:pt-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-[-5%] -z-10 h-[50vh] w-[40vw] rounded-full bg-yellow-500/5 blur-[120px]"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 font-sans">
        <motion.header
          className="shrink-0 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-[10px] font-semibold tracking-[0.25em] text-gray-500 uppercase sm:text-xs">
            {t("expertise.header")}
          </p>
          <p className="mx-auto mt-2 max-w-3xl text-balance text-sm leading-relaxed text-gray-300 sm:mt-3 sm:text-base md:text-lg">
            {t("expertise.description")}
          </p>
        </motion.header>

        <motion.div
          className="group/grid relative mx-auto mt-6 flex w-full max-w-6xl flex-col gap-6 px-4 lg:grid lg:grid-cols-3 lg:px-0"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {items.map((item, index) => {
            const imageSrc = CARD_IMAGES[index] ?? CARD_IMAGES[0];
            const isFirst = index === 0;

            return (
              <motion.article
                key={`${item.title}-${index}`}
                variants={cardVariants}
                className={cn(
                  "sticky lg:static flex h-[380px] flex-col overflow-hidden rounded-3xl border border-white/5 shadow-2xl transition-colors duration-300 lg:h-[420px]",
                  index === 0 && "top-[100px] lg:top-auto",
                  index === 1 && "top-[120px] lg:top-auto",
                  index === 2 && "top-[140px] lg:top-auto",
                  "bg-[#111] text-white hover:bg-yellow-500 hover:text-black"
                )}
              >
                <div className="relative flex-1 p-6 lg:p-8">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] opacity-70">
                    {item.tag}
                  </p>
                  <h3 className="w-3/4 text-xl font-bold leading-snug lg:text-2xl">{item.title}</h3>
                  <div
                    aria-hidden
                    className="absolute top-6 right-6 h-8 w-8 rounded-full border border-current opacity-50"
                  />
                </div>

                <div className="relative h-[45%] w-full shrink-0">
                  <Image
                    src={imageSrc}
                    alt={item.title}
                    fill
                    className="absolute inset-0 h-full w-full object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
