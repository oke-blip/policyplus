"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Globe2,
  Heart,
  Quote,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { AboutTeamSection, type AboutTeamMember } from "@/components/public/about-team-section";

const ABOUT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600";

const VALUE_KEYS = [
  "aboutPage.value1",
  "aboutPage.value2",
  "aboutPage.value3",
  "aboutPage.value4",
  "aboutPage.value5",
  "aboutPage.value6",
] as const;

const VALUE_ICONS: LucideIcon[] = [
  Target,
  UsersRound,
  BadgeCheck,
  Sparkles,
  Heart,
  Globe2,
];

type AboutFullPageProps = {
  /** Final snap section: CTA + multi-column footer (passed from `app/about/page.tsx`). */
  footer: ReactNode;
};

export function AboutFullPage({ footer }: AboutFullPageProps) {
  const { t } = useLanguage();

  const missionEyebrow = String(t("aboutPage.missionEyebrow"));
  const missionQuote = String(t("hero.subheadline"));
  const missionSupporting = String(t("about.description"));
  const valuesHeading = String(t("aboutPage.valuesHeading"));
  const teamEyebrow = String(t("aboutPage.teamEyebrow"));
  const teamHeading = String(t("aboutPage.teamHeading"));
  const teamSub = String(t("aboutPage.teamSub"));
  const teamJoinCta = String(t("aboutPage.teamJoinCta"));
  const teamKeyboardHint = String(t("aboutPage.teamKeyboardHint"));
  const teamTouchHint = String(t("aboutPage.teamTouchHint"));
  const teamRaw = t("aboutPage.teamMembers") as unknown;
  const teamMembers: AboutTeamMember[] = Array.isArray(teamRaw)
    ? (teamRaw as Array<{ name: string; role: string; focus?: string }>).map((m) => ({
        name: m.name,
        role: m.role,
        focus: typeof m.focus === "string" ? m.focus : "",
      }))
    : [];

  return (
    <main className="hide-scrollbar relative h-svh w-full snap-y snap-proximity overflow-x-hidden overflow-y-auto overscroll-y-contain bg-black font-sans">
      {/* Section 1 — Who we are */}
      <section
        id="about-hero"
        className="relative flex w-full min-h-svh snap-start flex-col justify-start overflow-x-hidden bg-black pt-[100px] pb-16 text-white lg:justify-center lg:pb-0 lg:pt-0"
        aria-labelledby="about-hero-heading"
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          {/* The Grid */}
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
            {/* Left: Text Content */}
            <div className="order-1 flex flex-col items-start justify-start text-left lg:justify-center">
              <span className="text-yellow-500 text-sm font-bold uppercase tracking-widest mb-4">
                WHO WE ARE
              </span>
              <h1
                id="about-hero-heading"
                className="mb-6 max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl"
              >
                Fostering Evidence-Based <br className="hidden lg:block" /> Policy in Indonesia
              </h1>
              <p className="mb-8 max-w-lg text-base text-gray-400">
                Policy Plus is an independent knowledge hub dedicated to transforming complex data
                into actionable insights. We bridge the gap between rigorous research and practical
                governance to drive sustainable development.
              </p>
              <button
                type="button"
                className="w-max self-start rounded-full bg-yellow-500 px-8 py-3 font-bold text-black transition-colors hover:bg-yellow-400"
              >
                Read our story -&gt;
              </button>
            </div>

            {/* Right: Image */}
            <div className="order-2 relative h-[260px] w-full overflow-hidden rounded-2xl sm:h-[320px] lg:h-[360px] lg:rounded-3xl">
              {/* KEEP YOUR EXISTING IMAGE TAG HERE */}
              <Image
                src={ABOUT_HERO_IMAGE}
                alt="Policy advisors collaborating"
                fill
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Mission (single scroll: no nested overflow) */}
      <section
        id="our-mission"
        className="relative isolate min-h-svh w-full shrink-0 snap-start bg-black"
        aria-labelledby="our-mission-quote"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 z-0 h-[min(72vh,36rem)] w-[min(85vw,40rem)] rounded-full bg-yellow-500/5 blur-[120px]"
        />

        <div className="relative z-10 mx-auto flex min-h-svh max-w-6xl flex-col items-center justify-center px-4 py-16 pt-28 text-center sm:px-6 sm:py-20 lg:py-24">
          <div className="relative w-full max-w-5xl px-2 sm:px-6">
            <Quote
              aria-hidden
              className="pointer-events-none absolute -left-2 top-1/2 z-0 h-40 w-40 -translate-y-1/2 text-yellow-500/[0.07] sm:h-52 sm:w-52 lg:left-4 lg:h-64 lg:w-64"
              strokeWidth={1}
            />
            <div className="relative z-10 rounded-3xl border border-white/[0.08] bg-white/[0.03] px-6 py-10 shadow-[0_0_80px_rgba(234,179,8,0.06)] backdrop-blur-md sm:px-10 sm:py-12 lg:px-14 lg:py-14">
              <p className="text-xs font-semibold tracking-[0.28em] text-yellow-500 uppercase">
                {missionEyebrow}
              </p>
              <blockquote
                id="our-mission-quote"
                className="mt-6 mb-8 text-3xl font-bold leading-snug text-white sm:text-4xl lg:text-5xl"
              >
                {missionQuote}
              </blockquote>
              <p className="text-center text-base leading-relaxed text-gray-400 sm:text-lg">
                {missionSupporting}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — What we value */}
      <section
        id="what-we-value"
        className="relative min-h-svh w-full shrink-0 snap-start bg-black"
        aria-labelledby="what-we-value-heading"
      >
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:pb-28">
          <h2
            id="what-we-value-heading"
            className="mb-12 text-center text-3xl font-bold text-white lg:text-5xl"
          >
            {valuesHeading}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {VALUE_KEYS.map((key, index) => {
              const Icon = VALUE_ICONS[index]!;
              return (
                <div
                  key={key}
                  className="flex flex-col items-start gap-4 rounded-2xl border border-white/5 bg-[#111] p-8 transition-transform hover:-translate-y-1"
                >
                  <Icon className="size-9 shrink-0 text-yellow-500" strokeWidth={1.75} aria-hidden />
                  <p className="text-left text-base font-medium leading-snug text-gray-100">
                    {String(t(key))}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 4 — Our team (interactive spotlight + roster) */}
      {teamMembers.length > 0 ? (
        <AboutTeamSection
          eyebrow={teamEyebrow}
          heading={teamHeading}
          sub={teamSub}
          joinCta={teamJoinCta}
          keyboardHint={teamKeyboardHint}
          touchHint={teamTouchHint}
          members={teamMembers}
        />
      ) : null}

      {/* Section 5 — Footer + CTA */}
      <section id="about-footer" className="min-h-svh w-full shrink-0 snap-start bg-black">
        <div className="px-4 pb-12 pt-28 sm:px-6">{footer}</div>
      </section>
    </main>
  );
}
