"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Globe2,
  Heart,
  Quote,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";

import { getAboutValueIcon, getDefaultAboutValueIconId } from "@/lib/about-value-icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { AboutTeamSection, type AboutTeamMember } from "@/components/public/about-team-section";
import { CTAFooterSection } from "@/components/public/CTAFooterSection";
import { pickLocalized } from "@/lib/content-locale";
import {
  hasAboutPageSource,
  pickAboutBilingualField,
  pickAboutSettings,
  type AboutPageSettings,
} from "@/lib/about-intro-settings";
import type { AboutValueItem } from "@/lib/settings-utils";
import { parseTeamMembers, type TeamMemberRecord } from "@/lib/team-members";

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

export type { AboutPageSettings };

type AboutFullPageProps = {
  /** CMS roster from settings (`team_members`), sorted by `order` when loaded server-side. */
  initialTeamMembers?: TeamMemberRecord[];
  /** About page copy from settings, when loaded server-side. */
  initialAboutSettings?: AboutPageSettings;
  /** CTA + footer copy from settings (`cta_*`, contact, social), when loaded server-side. */
  initialCtaSettings?: Record<string, unknown>;
};

function toAboutMembers(
  records: TeamMemberRecord[],
  locale: "en" | "id",
): AboutTeamMember[] {
  return records.map(
    ({
      id,
      name,
      name_id,
      role,
      role_id,
      focus,
      focus_id,
      bio,
      bio_id,
      image,
      category,
      isLeadership,
    }) => ({
      id,
      name: pickLocalized(locale, name, name_id),
      role: pickLocalized(locale, role, role_id),
      focus: pickLocalized(locale, focus, focus_id),
      ...(image?.trim() ? { image: image.trim() } : {}),
      category: category ?? "internal",
      ...(isLeadership ? { isLeadership: true } : {}),
      ...(isLeadership
        ? { bio: pickLocalized(locale, bio ?? "", bio_id) }
        : {}),
    }),
  );
}

function localizeValueItems(
  items: AboutValueItem[],
  locale: "en" | "id",
): AboutValueItem[] {
  return items.map((item) => ({
    ...item,
    text: pickLocalized(locale, item.text, item.text_id),
  }));
}

export function AboutFullPage({
  initialTeamMembers,
  initialAboutSettings,
  initialCtaSettings,
}: AboutFullPageProps) {
  const { locale, t } = useLanguage();
  const [fetchedTeam, setFetchedTeam] = useState<TeamMemberRecord[]>([]);
  const [fetchedAbout, setFetchedAbout] = useState<AboutPageSettings | null>(null);
  const [fetchedCtaSettings, setFetchedCtaSettings] = useState<Record<string, unknown> | null>(null);

  const settingsSource = useMemo(
    () => initialCtaSettings ?? fetchedCtaSettings ?? {},
    [initialCtaSettings, fetchedCtaSettings],
  );

  const ctaSettings = settingsSource;

  const about = useMemo(
    () => initialAboutSettings ?? fetchedAbout ?? pickAboutSettings(settingsSource),
    [initialAboutSettings, fetchedAbout, settingsSource],
  );

  const heroSubtitle = pickAboutBilingualField(
    settingsSource,
    "about_hero_subtitle",
    locale,
    String(t("about.eyebrow")),
  );
  const heroTitle = pickAboutBilingualField(
    settingsSource,
    "about_hero_title",
    locale,
    String(t("about.title")),
  );
  const heroDescription = pickAboutBilingualField(
    settingsSource,
    "about_hero_description",
    locale,
    String(t("about.description")),
  );
  const heroImage =
    about.about_hero_image?.trim() || ABOUT_HERO_IMAGE;
  const heroCtaText = pickAboutBilingualField(
    settingsSource,
    "about_hero_cta_text",
    locale,
    String(t("about.link")),
  );
  const heroCtaLink = about.about_hero_cta_link?.trim() || "";

  const missionEyebrow = pickAboutBilingualField(
    settingsSource,
    "about_mission_eyebrow",
    locale,
    String(t("aboutPage.missionEyebrow")),
  );
  const missionQuote = pickAboutBilingualField(
    settingsSource,
    "about_mission_title",
    locale,
    String(t("hero.subheadline")),
  );
  const missionSupporting = pickAboutBilingualField(
    settingsSource,
    "about_mission_description",
    locale,
    String(t("about.description")),
  );
  const valuesHeading = pickAboutBilingualField(
    settingsSource,
    "about_values_heading",
    locale,
    String(t("aboutPage.valuesHeading")),
  );
  const teamEyebrow = pickAboutBilingualField(
    settingsSource,
    "about_team_eyebrow",
    locale,
    String(t("aboutPage.teamEyebrow")),
  );
  const teamHeading = pickAboutBilingualField(
    settingsSource,
    "about_team_title",
    locale,
    String(t("aboutPage.teamHeading")),
  );
  const teamSub = pickAboutBilingualField(
    settingsSource,
    "about_team_subtitle",
    locale,
    String(t("aboutPage.teamSub")),
  );
  const teamJoinCta = String(t("aboutPage.teamJoinCta"));
  const teamKeyboardHint = String(t("aboutPage.teamKeyboardHint"));
  const teamTouchHint = String(t("aboutPage.teamTouchHint"));
  const cmsTeam = useMemo(() => {
    if (initialTeamMembers !== undefined) return initialTeamMembers;
    return fetchedTeam;
  }, [initialTeamMembers, fetchedTeam]);

  const teamMembers = useMemo(() => toAboutMembers(cmsTeam, locale), [cmsTeam, locale]);

  useEffect(() => {
    const needsTeam = initialTeamMembers === undefined;
    const needsAbout =
      initialAboutSettings === undefined && !hasAboutPageSource(initialCtaSettings);
    const needsCta = initialCtaSettings === undefined;
    if (!needsTeam && !needsAbout && !needsCta) return;

    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((settings) => {
        const raw = settings as Record<string, unknown>;
        if (needsTeam) {
          setFetchedTeam(parseTeamMembers(settings.team_members));
        }
        if (needsAbout && hasAboutPageSource(raw)) {
          setFetchedAbout(pickAboutSettings(raw));
        }
        if (needsCta) {
          setFetchedCtaSettings(raw);
        }
      })
      .catch(() => {});
  }, [initialTeamMembers, initialAboutSettings, initialCtaSettings]);

  const cmsValues = useMemo(() => {
    const items = about.about_value_items;
    if (!items?.length) return [];
    return localizeValueItems(items, locale);
  }, [about.about_value_items, locale]);

  const localeValues = useMemo(
    () => VALUE_KEYS.map((key) => String(t(key))),
    [t],
  );

  const valueCards = cmsValues.length > 0 ? cmsValues : localeValues.map((text, index) => ({
    id: index,
    text,
    icon: getDefaultAboutValueIconId(index),
  }));

  const teamEmptyMessage = String(t("aboutPage.teamEmpty"));

  return (
    <main className="hide-scrollbar relative h-svh w-full snap-y snap-proximity overflow-x-hidden overflow-y-auto overscroll-y-contain bg-gray-50 font-sans dark:bg-black">
      {/* Section 1 — Who we are */}
      <section
        id="about-hero"
        className="relative flex w-full min-h-svh snap-start flex-col justify-start overflow-x-hidden bg-gray-50 pt-[100px] pb-16 text-gray-900 dark:bg-black dark:text-white lg:justify-center lg:pb-0 lg:pt-0"
        aria-labelledby="about-hero-heading"
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          {/* The Grid */}
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
            {/* Left: Text Content */}
            <div className="order-1 flex flex-col items-start justify-start text-left lg:justify-center">
              <span className="mb-4 text-sm font-bold tracking-widest text-yellow-600 uppercase dark:text-yellow-500">
                {heroSubtitle}
              </span>
              <h1
                id="about-hero-heading"
                className="mb-6 max-w-xl text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white"
              >
                {heroTitle}
              </h1>
              <p className="mb-8 max-w-lg text-base text-gray-600 dark:text-gray-400">{heroDescription}</p>
              {heroCtaText ? (
                heroCtaLink ? (
                  <Link
                    href={heroCtaLink}
                    className="group inline-flex w-max items-center gap-2 self-start rounded-full bg-yellow-500 px-8 py-3 font-bold text-black transition-colors hover:bg-yellow-400"
                  >
                    {heroCtaText}
                    <ArrowRight
                      className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden
                    />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="group inline-flex w-max items-center gap-2 self-start rounded-full bg-yellow-500 px-8 py-3 font-bold text-black transition-colors hover:bg-yellow-400"
                  >
                    {heroCtaText}
                    <ArrowRight
                      className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden
                    />
                  </button>
                )
              ) : null}
            </div>

            {/* Right: Image */}
            <div className="order-2 relative h-[260px] w-full overflow-hidden rounded-2xl sm:h-[320px] lg:h-[360px] lg:rounded-3xl">
              {/* KEEP YOUR EXISTING IMAGE TAG HERE */}
              <Image
                src={heroImage}
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
        className="relative isolate min-h-svh w-full shrink-0 snap-start bg-gray-50 dark:bg-black"
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
            <div className="relative z-10 rounded-3xl border border-gray-200/90 bg-white/90 px-6 py-10 shadow-[0_0_80px_rgba(234,179,8,0.08)] backdrop-blur-md sm:px-10 sm:py-12 dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-[0_0_80px_rgba(234,179,8,0.06)] lg:px-14 lg:py-14">
              <p className="text-xs font-semibold tracking-[0.28em] text-yellow-600 uppercase dark:text-yellow-500">
                {missionEyebrow}
              </p>
              <blockquote
                id="our-mission-quote"
                className="mt-6 mb-8 text-3xl font-bold leading-snug text-gray-900 sm:text-4xl lg:text-5xl dark:text-white"
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
        className="relative min-h-svh w-full shrink-0 snap-start bg-gray-50 dark:bg-black"
        aria-labelledby="what-we-value-heading"
      >
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:pb-28">
          <h2
            id="what-we-value-heading"
            className="mb-12 text-center text-3xl font-bold text-gray-900 lg:text-5xl dark:text-white"
          >
            {valuesHeading}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {valueCards.map((item, index) => {
              const iconFromPicker = getAboutValueIcon(
                "icon" in item ? item.icon : getDefaultAboutValueIconId(index),
              );
              const FallbackIcon = VALUE_ICONS[index] ?? Target;
              const Icon = iconFromPicker ?? FallbackIcon;
              const cardKey = "id" in item ? String(item.id ?? index) : `locale-${index}`;
              const text = "text" in item ? item.text : String(item);
              const image = "image" in item && item.image?.trim() ? item.image.trim() : "";

              return (
                <div
                  key={cardKey}
                  className="flex flex-col items-start gap-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-transform hover:-translate-y-1 dark:border-white/5 dark:bg-[#111] dark:shadow-none"
                >
                  {image ? (
                    <div className="relative size-9 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="36px"
                        unoptimized={image.startsWith("data:")}
                      />
                    </div>
                  ) : (
                    <Icon className="size-9 shrink-0 text-yellow-600 dark:text-yellow-500" strokeWidth={1.75} aria-hidden />
                  )}
                  <p className="text-left text-base font-medium leading-snug text-gray-800 dark:text-gray-100">{text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 4 — Our team (CMS `team_members` only; order from admin) */}
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
      ) : (
        <section
          id="meet-the-team"
          className="relative min-h-[40vh] w-full shrink-0 snap-start bg-gray-50 dark:bg-black"
          aria-labelledby="about-team-empty-heading"
        >
          <div className="mx-auto max-w-3xl px-4 py-28 text-center sm:px-6 lg:py-32">
            <p className="text-xs font-semibold tracking-[0.32em] text-yellow-600 uppercase dark:text-yellow-500">{teamEyebrow}</p>
            <h2 id="about-team-empty-heading" className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
              {teamHeading}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-400">{teamEmptyMessage}</p>
          </div>
        </section>
      )}

      {/* Section 5 — CTA + footer (shared with home) */}
      <CTAFooterSection settings={ctaSettings} />
    </main>
  );
}
