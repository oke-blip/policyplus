"use client";

import Image from "next/image";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type PartnerItem = {
  name: string;
  image: string;
};

function PartnerCard({ partner }: { partner: PartnerItem }) {
  return (
    <div className="group relative flex h-32 w-48 shrink-0 cursor-pointer items-center justify-center lg:h-40 lg:w-64">
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-gray-800 bg-[#0a0a0a] transition-all duration-300 ease-out",
          "group-hover:z-50 group-hover:scale-125 group-hover:border-yellow-500 group-hover:shadow-[0_0_50px_rgba(234,179,8,0.4)]"
        )}
      >
        <div className="relative h-full w-full overflow-hidden rounded-xl">
          <Image
            src={partner.image}
            alt=""
            fill
            sizes="(max-width: 1024px) 192px, 256px"
            className="object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-40"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="px-3 text-center text-base font-bold text-yellow-400 lg:text-lg">{partner.name}</span>
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
          <PartnerCard key={`${p.name}-${i}`} partner={p} />
        ))}
      </div>
    </div>
  );
}

export function Partners({ data }: { data?: any }) {
  const { t } = useLanguage();
  
  const header = data?.partners_header || t("partners.header");
  const items = data?.partners && data.partners.length > 0 
    ? data.partners 
    : t<PartnerItem[]>("partners.items");

  return (
    <section className="relative isolate flex min-h-svh w-full snap-start flex-col bg-black pt-28 pb-12 lg:pt-32 lg:pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-6%] right-[-8%] -z-10 h-[52vh] w-[46vw] rounded-full bg-white/5 blur-[120px]"
      />
      <header className="relative z-10 mx-auto w-full max-w-7xl shrink-0 px-4 text-center">
        <h2 className="font-sans text-xl font-bold uppercase tracking-wide text-white sm:text-2xl md:text-3xl">
          {header}
        </h2>
      </header>

      <div className="relative z-10 mx-auto mt-10 flex w-full min-h-0 max-w-[100vw] flex-1 flex-col justify-center gap-2 lg:mt-12 lg:gap-4">
        <PartnerMarqueeRow partners={items} durationSec={46} />
        <PartnerMarqueeRow partners={items} rtl durationSec={52} />
      </div>
    </section>
  );
}
