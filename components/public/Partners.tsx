"use client";

import Image from "next/image";

import { useLanguage } from "@/contexts/LanguageContext";
import { pickLocalized } from "@/lib/content-locale";
import {
  loadLogoItemsFromSettings,
  splitLogoItemsByType,
} from "@/lib/partners-testimonials";
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
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/90 px-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="block text-center text-base font-bold text-yellow-400 lg:text-lg">
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
  // 1. Jika data kosong, jangan render apa-apa biar tidak error
  if (!partners || partners.length === 0) return null;

  // 2. Tentukan minimal jumlah card untuk menutupi 1 layar penuh (sekitar 8-10 card)
  const MIN_CARDS_TO_FILL_SCREEN = 10;
  
  // 3. Hitung berapa kali array asli harus diulang agar mencapai batas minimal
  const repeatCount = Math.max(1, Math.ceil(MIN_CARDS_TO_FILL_SCREEN / partners.length));
  
  // 4. Buat array dasar yang sudah cukup panjang menutupi layar
  const baseArray = Array(repeatCount).fill(partners).flat();

  // 5. Duplikasi array dasar tersebut SATU KALI SAJA untuk efek transisi 50% marquee
  const loop = [...baseArray, ...baseArray];

  return (
    <div className="relative flex overflow-hidden py-4 w-full">
      <div
        className={cn(
          "flex w-max partners-marquee-track", // Tambahkan flex dan w-max agar tidak turun ke bawah (wrap)
          rtl && "partners-marquee-track-rtl"
        )}
        style={{ ["--partners-duration" as string]: `${durationSec}s` }}
      >
        {loop.map((p, i) => (
          <PartnerCard key={`${p.name}-${i}`} partner={p} />
        ))}
      </div>
    </div>
  );
}

export function Partners({ data }: { data?: Record<string, unknown> }) {
  const { t, locale } = useLanguage();

  const headerEn =
    typeof data?.partners_header === "string" ? data.partners_header : "";
  const headerId =
    typeof data?.partners_header_id === "string" ? data.partners_header_id : "";
  const header = pickLocalized(locale, headerEn, headerId) || t("partners.header");
  const descriptionEn =
    typeof data?.partners_description === "string" ? data.partners_description : "";
  const descriptionId =
    typeof data?.partners_description_id === "string" ? data.partners_description_id : "";
  const sectionDescription = pickLocalized(locale, descriptionEn, descriptionId).trim();
  const { partners: partnerRows, mediaCoverage } = splitLogoItemsByType(
    loadLogoItemsFromSettings(data ?? {}),
  );
  const items: PartnerItem[] =
    partnerRows.length > 0
      ? partnerRows
          .filter((p) => (p.image ?? "").trim())
          .map((p) => ({
            name: p.name,
            image: p.image ?? "",
          }))
      : t<PartnerItem[]>("partners.items");

  const mediaItems: PartnerItem[] = mediaCoverage
    .filter((m) => (m.image ?? "").trim())
    .map((m) => {
      const nameEn = m.name.trim();
      const nameId = m.name_id?.trim() ?? "";
      const name = pickLocalized(locale, nameEn, nameId) || nameEn || nameId;
      return { name, image: m.image ?? "" };
    });

  return (
    <section className="relative isolate flex min-h-svh w-full snap-start flex-col bg-black pt-28 pb-12 lg:pt-32 lg:pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-6%] right-[-8%] -z-10 h-[52vh] w-[46vw] rounded-full bg-white/5 blur-[120px]"
      />
      <header className="relative z-10 mx-auto w-full max-w-3xl shrink-0 px-4 text-center">
        <h2 className="font-sans text-xl font-bold uppercase tracking-wide text-white sm:text-2xl md:text-3xl">
          {header}
        </h2>
        {sectionDescription ? (
          <p className="mt-4 text-base leading-relaxed text-gray-400">
            {sectionDescription}
          </p>
        ) : null}
      </header>

      <div className="relative z-10 mx-auto mt-10 flex w-full min-h-0 max-w-[100vw] flex-1 flex-col justify-center gap-2 lg:mt-12 lg:gap-4">
        <PartnerMarqueeRow partners={items} durationSec={46} />
        <PartnerMarqueeRow partners={items} rtl durationSec={52} />
        {mediaItems.length > 0 ? (
          <>
            <PartnerMarqueeRow partners={mediaItems} durationSec={48} />
            <PartnerMarqueeRow partners={mediaItems} rtl durationSec={54} />
          </>
        ) : null}
      </div>
    </section>
  );
}
