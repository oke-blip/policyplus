"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Navbar } from "@/components/Navbar";
import { CTAFooterSection } from "@/components/public/CTAFooterSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { pickLocalized, type ContentLocale } from "@/lib/content-locale";
import type {
  MenuDraftEventRecord,
  MenuDraftJobRecord,
  MenuDraftPostRecord,
} from "@/lib/menu-draft-data";
import {
  resolveKnowledgeCenterHeader,
  resolveLatestInsightsTitle,
} from "@/lib/publications-section-settings";
import { stripHtml } from "@/lib/strip-html";
import { type ApproachItem, type ExpertiseItem } from "@/lib/settings-utils";

type NavCard = {
  title: string;
  description: string;
  href: string;
  category?: string;
};

const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Expertise", href: "/expertise" },
  { label: "Our Work", href: "/work" },
  { label: "Knowledge Center", href: "/knowledge-center" },
  { label: "Insights", href: "/insights" },
  { label: "Events", href: "/events" },
  { label: "Career", href: "/career" },
] as const;

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

function localizeExpertiseItems(items: ExpertiseItem[], locale: ContentLocale): NavCard[] {
  return items.map((item) => ({
    title: pickLocalized(locale, item.title, item.title_id),
    description: item.desc ? pickLocalized(locale, item.desc, item.desc_id) : "",
    category: pickLocalized(locale, item.tag, item.tag_id),
    href: "/work",
  }));
}

function localizeApproachItems(items: ApproachItem[], locale: ContentLocale): NavCard[] {
  return items.map((item) => ({
    title: pickLocalized(locale, item.title, item.title_id),
    description: pickLocalized(locale, item.desc, item.desc_id),
    href: "/knowledge-center",
  }));
}

function mapKnowledgePosts(posts: MenuDraftPostRecord[], locale: ContentLocale): NavCard[] {
  return posts.map((post) => {
    const title = pickLocalized(locale, post.title, post.title_id);
    const content = pickLocalized(locale, post.content, post.content_id);
    return {
      title,
      description: stripHtml(content),
      href: `/knowledge-center/${encodeURIComponent(post.slug || post.id)}`,
    };
  });
}

function mapInsightPosts(posts: MenuDraftPostRecord[], locale: ContentLocale): NavCard[] {
  return posts.map((post) => {
    const title = pickLocalized(locale, post.title, post.title_id);
    const content = pickLocalized(locale, post.content, post.content_id);
    return {
      title,
      description: stripHtml(content),
      href: `/insights/${encodeURIComponent(post.id)}`,
    };
  });
}

function mapEventRecords(events: MenuDraftEventRecord[], locale: ContentLocale): NavCard[] {
  return events.map((event) => ({
    title: pickLocalized(locale, event.title, event.title_id),
    description: `${event.date} — ${pickLocalized(locale, event.location, event.location_id)}`,
    href: event.link?.trim() || "/events",
  }));
}

function mapJobRecords(jobs: MenuDraftJobRecord[], locale: ContentLocale): NavCard[] {
  return jobs.map((job) => ({
    title: pickLocalized(locale, job.title, job.title_id),
    description: stripHtml(pickLocalized(locale, job.description, job.description_id)),
    href: "/career",
  }));
}

function ExpertiseCardsGrid({ cards }: { cards: NavCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {cards.map((card) => (
        <article
          key={`${card.title}-${card.category ?? ""}`}
          className="relative flex min-h-[220px] flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-b from-[#161616] to-[#0c0c0c] p-6 sm:p-7"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"
          />
          {card.category?.trim() ? (
            <p className="text-[10px] font-semibold tracking-[0.22em] text-yellow-500 uppercase sm:text-xs">
              {card.category}
            </p>
          ) : null}
          <h3
            className={`text-lg font-bold leading-snug text-white sm:text-xl ${card.category?.trim() ? "mt-3" : ""}`}
          >
            {card.title}
          </h3>
          {card.description.trim() ? (
            <p className="mt-3 text-sm leading-relaxed text-gray-400 line-clamp-4">{card.description}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function DraftPageShell({
  eyebrow,
  title,
  description,
  cards,
  primaryCta,
  secondaryCta,
  settings,
  cardVariant = "default",
}: {
  eyebrow: string;
  title: string;
  description: string;
  cards: NavCard[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  settings?: Record<string, unknown>;
  cardVariant?: "default" | "expertise";
}) {
  return (
    <>
      <Navbar />
      {/* Document scroll only: avoids nested scroll traps vs. landing’s in-main snap */}
      <main className="hide-scrollbar w-full overflow-x-hidden bg-black pb-12 font-sans text-white">
        <section className="relative border-b border-white/[0.06] px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:pt-32">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[-8%] right-[-8%] -z-10 h-[55vh] w-[42vw] rounded-full bg-yellow-500/10 blur-[120px]"
          />
          <div className="relative mx-auto flex min-h-[min(100svh,920px)] w-full max-w-7xl flex-col items-center justify-center px-0 text-center lg:min-h-[72svh] lg:px-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-yellow-500 uppercase">{eyebrow}</p>
            <h1 className="mt-4 max-w-5xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-gray-300 sm:text-base lg:text-lg">
              {description}
            </p>

            <div className="mt-8 flex w-full max-w-xl flex-wrap items-center justify-center gap-3">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-gray-200 transition-colors hover:border-yellow-500 hover:text-yellow-400 sm:text-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              <Link
                href={primaryCta.href}
                className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-full bg-yellow-500 px-8 py-3 text-sm font-semibold text-black transition-colors hover:bg-yellow-400 sm:w-auto"
              >
                {primaryCta.label}
              </Link>
              <Link
                href={secondaryCta.href}
                className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-full border border-yellow-500 px-8 py-3 text-sm font-semibold text-yellow-400 transition-colors hover:bg-yellow-500 hover:text-black sm:w-auto"
              >
                {secondaryCta.label}
              </Link>
            </div>
          </div>
        </section>

        <section className="relative px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            {cardVariant === "expertise" ? (
              <ExpertiseCardsGrid cards={cards} />
            ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <article
                  key={`${card.title}-${card.href}`}
                  className="group flex min-h-[240px] flex-col rounded-3xl border border-white/10 bg-[#101010] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/60"
                >
                  <h3 className="text-xl font-bold leading-snug text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-400">{card.description}</p>
                  <Link
                    href={card.href}
                    className="mt-auto pt-6 text-sm font-semibold text-yellow-400 transition-colors group-hover:text-yellow-300"
                  >
                    Explore →
                  </Link>
                </article>
              ))}
            </div>
            )}
          </div>
        </section>

        <CTAFooterSection settings={settings} />
      </main>
    </>
  );
}

export function ExpertiseDraftPage({
  settings,
  expertiseItems = [],
}: {
  settings?: Record<string, unknown>;
  expertiseItems?: ExpertiseItem[];
}) {
  const { t, locale } = useLanguage();

  const eyebrow = pickSettingsField(
    settings,
    "expertise_header",
    locale,
    String(t("expertise.header")),
  );
  const description = pickSettingsField(
    settings,
    "expertise_description",
    locale,
    String(t("expertise.description")),
  );

  const cards = useMemo(() => {
    const fromDb = localizeExpertiseItems(expertiseItems.slice(0, 6), locale).filter(
      (card) => card.title.trim(),
    );
    if (fromDb.length > 0) return fromDb;
    return t<Array<{ tag: string; title: string; desc: string }>>("expertise.items")
      .slice(0, 6)
      .map((item) => ({
        title: item.title,
        description: item.desc,
        category: item.tag,
        href: "/work",
      }));
  }, [expertiseItems, locale, t]);

  return (
    <DraftPageShell
      eyebrow={eyebrow}
      title="Turning evidence and collaboration into policy outcomes that scale"
      description={description}
      cards={cards}
      cardVariant="expertise"
      primaryCta={{ label: "See Our Work", href: "/work" }}
      secondaryCta={{ label: "Read Insights", href: "/insights" }}
      settings={settings}
    />
  );
}

export function WorkDraftPage({
  settings,
  approachItems = [],
}: {
  settings?: Record<string, unknown>;
  approachItems?: ApproachItem[];
}) {
  const { t, locale } = useLanguage();

  const eyebrow = pickSettingsField(
    settings,
    "approach_line1",
    locale,
    String(t("approach.headerLine1")),
  );
  const title = pickSettingsField(
    settings,
    "approach_line2",
    locale,
    String(t("approach.headerLine2")),
  );
  const description = pickSettingsField(
    settings,
    "approach_description",
    locale,
    String(t("approach.description")),
  );

  const cards = useMemo(() => {
    const fromDb = localizeApproachItems(approachItems.slice(0, 4), locale).filter(
      (card) => card.title.trim(),
    );
    if (fromDb.length > 0) return fromDb;
    return t<Array<{ title: string; desc: string }>>("approach.items")
      .slice(0, 4)
      .map((item) => ({
        title: item.title,
        description: item.desc,
        href: "/knowledge-center",
      }));
  }, [approachItems, locale, t]);

  return (
    <DraftPageShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      cards={cards}
      primaryCta={{ label: "Open Knowledge Center", href: "/knowledge-center" }}
      secondaryCta={{ label: "Browse Events", href: "/events" }}
      settings={settings}
    />
  );
}

export function KnowledgeCenterDraftPage({
  settings,
  posts = [],
}: {
  settings?: Record<string, unknown>;
  posts?: MenuDraftPostRecord[];
}) {
  const { t, locale } = useLanguage();

  const header = useMemo(
    () =>
      resolveKnowledgeCenterHeader(settings, locale, {
        title: String(t("knowledge.header")),
        subtitle: String(t("knowledge.description")),
      }),
    [settings, locale, t],
  );

  const cards = useMemo(() => {
    const fromDb = mapKnowledgePosts(posts, locale).filter((card) => card.title.trim());
    if (fromDb.length > 0) return fromDb;
    return t<Array<{ title: string; preview: string }>>("knowledge.items")
      .slice(0, 6)
      .map((item) => ({
        title: item.title,
        description: item.preview,
        href: "/insights",
      }));
  }, [posts, locale, t]);

  return (
    <DraftPageShell
      eyebrow={header.title}
      title="A curated hub of practical policy resources and field-ready evidence"
      description={header.subtitle}
      cards={cards}
      primaryCta={{ label: "Read Latest Insights", href: "/insights" }}
      secondaryCta={{ label: "Explore Expertise", href: "/expertise" }}
      settings={settings}
    />
  );
}

export function InsightsDraftPage({
  settings,
  posts = [],
}: {
  settings?: Record<string, unknown>;
  posts?: MenuDraftPostRecord[];
}) {
  const { t, locale } = useLanguage();

  const eyebrow = useMemo(
    () => resolveLatestInsightsTitle(settings, locale, String(t("insights.header"))),
    [settings, locale, t],
  );

  const cards = useMemo(() => {
    const fromDb = mapInsightPosts(posts, locale).filter((card) => card.title.trim());
    if (fromDb.length > 0) return fromDb;
    return t<Array<{ title: string; excerpt: string }>>("insights.items")
      .slice(0, 6)
      .map((item) => ({
        title: item.title,
        description: item.excerpt,
        href: "/insights",
      }));
  }, [posts, locale, t]);

  return (
    <DraftPageShell
      eyebrow={eyebrow}
      title="Fresh analysis for policy leaders, practitioners, and delivery teams"
      description="Draft insights hub connected to events, publications, and expertise pages for smooth exploration."
      cards={cards}
      primaryCta={{ label: "See Upcoming Events", href: "/events" }}
      secondaryCta={{ label: "Open Knowledge Center", href: "/knowledge-center" }}
      settings={settings}
    />
  );
}

export function EventsDraftPage({
  settings,
  events = [],
}: {
  settings?: Record<string, unknown>;
  events?: MenuDraftEventRecord[];
}) {
  const { t, locale } = useLanguage();

  const cards = useMemo(() => {
    const fromDb = mapEventRecords(events, locale).filter((card) => card.title.trim());
    if (fromDb.length > 0) return fromDb;
    return t<Array<{ title: string; date: string; location: string }>>("events.items")
      .slice(0, 6)
      .map((item) => ({
        title: item.title,
        description: `${item.date} — ${item.location}`,
        href: "/events",
      }));
  }, [events, locale, t]);

  return (
    <DraftPageShell
      eyebrow={String(t("events.header"))}
      title="Convenings, workshops, and roundtables that move policy into action"
      description="Draft events page connected to insights and knowledge content so users can continue discovery without dead-ends."
      cards={cards}
      primaryCta={{ label: "Read Related Insights", href: "/insights" }}
      secondaryCta={{ label: "View Our Work", href: "/work" }}
      settings={settings}
    />
  );
}

export function CareerDraftPage({
  settings,
  jobs = [],
}: {
  settings?: Record<string, unknown>;
  jobs?: MenuDraftJobRecord[];
}) {
  const { locale } = useLanguage();

  const cards = useMemo(() => {
    const fromDb = mapJobRecords(jobs, locale).filter((card) => card.title.trim());
    if (fromDb.length > 0) return fromDb;
    return [
      {
        title: "Policy Research Associate",
        description:
          "Support evidence synthesis, policy diagnostics, and brief development across governance programs.",
        href: "/expertise",
      },
      {
        title: "Stakeholder Engagement Lead",
        description:
          "Design and run multi-sector dialogues with public institutions, development partners, and civil society.",
        href: "/work",
      },
      {
        title: "Program Management Officer",
        description:
          "Coordinate delivery timelines, partner reporting, and internal quality loops for strategic projects.",
        href: "/about",
      },
    ];
  }, [jobs, locale]);

  return (
    <DraftPageShell
      eyebrow="CAREER"
      title="Join a mission-driven team shaping better policy outcomes"
      description="Draft career page connected to the broader site journey, with direct paths to expertise, work, and company background."
      cards={cards}
      primaryCta={{ label: "Learn About Us", href: "/about" }}
      secondaryCta={{ label: "Explore Our Expertise", href: "/expertise" }}
      settings={settings}
    />
  );
}
