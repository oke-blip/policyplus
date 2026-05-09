"use client";

import Image from "next/image";

import { useLanguage } from "@/contexts/LanguageContext";
import { asArray, cn } from "@/lib/utils";
import {
  SECTION_HEADER,
  SECTION_SCROLL_BODY,
  SECTION_SCROLL_STYLE,
  SNAP_SECTION,
} from "@/lib/section-shell";

type PartnerItem = {
  name: string;
  image: string;
};

function PartnerCard({ partner }: { partner: PartnerItem }) {
  return (
    <div className="group relative flex h-20 w-32 shrink-0 cursor-pointer items-center justify-center lg:h-40 lg:w-64">
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-gray-800 bg-[#0a0a0a] transition-all duration-300 ease-out",
          "lg:group-hover:z-50 lg:group-hover:scale-125 lg:group-hover:border-yellow-500 lg:group-hover:shadow-[0_0_50px_rgba(234,179,8,0.4)] active:scale-105"
        )}
      >
        <div className="relative h-full w-full overflow-hidden rounded-xl">
          <Image
            src={partner.image}
            alt=""
            fill
            sizes="(max-width: 1024px) 128px, 256px"
            className="object-cover opacity-90 transition-opacity duration-300 lg:group-hover:opacity-40"
          />
        </div>
        {/* Touch: name always partially visible; hover polish on lg+ */}
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/55 px-1.5 opacity-100 transition-opacity duration-300 lg:bg-black/90 lg:opacity-0 lg:group-hover:opacity-100">
          <span className="line-clamp-2 text-center text-[10px] font-bold leading-tight text-yellow-400 lg:line-clamp-none lg:px-3 lg:text-base lg:text-lg">
            {partner.name}
          </span>
        </div>
      </div>
    </div>
  );
}

function PartnerMarqueeRow({
  partners,
  rtl,
  durationSec,
}: {
  partners: PartnerItem[];
  rtl?: boolean;
  durationSec: number;
}) {
  const loop = [...partners, ...partners];

  return (
    <div className="relative overflow-hidden py-4">
      <div
        className={cn("partners-marquee-track", rtl && "partners-marquee-track-rtl")}
        style={{ ["--partners-duration" as string]: `${durationSec}s` }}
      >
        {loop.map((p, i) => (
          <PartnerCard key={`partner-marquee-${i}-${p.name}`} partner={p} />
        ))}
      </div>
    </div>
  );
}

export function Partners() {
  const { t } = useLanguage();
  const items = asArray<PartnerItem>(t("partners.items"));

  return (
    <section className={`${SNAP_SECTION} isolate`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[25] bg-black"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-6%] right-[-8%] -z-10 h-[52vh] w-[46vw] rounded-full bg-white/5 blur-[120px]"
      />

      <header className={`${SECTION_HEADER} text-center lg:text-center text-white`}>
        <h2 className="font-serif text-xl font-bold uppercase tracking-wide text-white sm:text-2xl md:text-3xl">
          {t("partners.header")}
        </h2>
      </header>

      <div className={SECTION_SCROLL_BODY} style={SECTION_SCROLL_STYLE}>
        <div className="mx-auto flex w-full min-h-0 max-w-[100vw] flex-col justify-start gap-2 lg:gap-4">
          <PartnerMarqueeRow partners={items} durationSec={46} />
          <PartnerMarqueeRow partners={items} rtl durationSec={52} />
          <PartnerMarqueeRow partners={items} durationSec={58} />
        </div>
      </div>
    </section>
  );
}
