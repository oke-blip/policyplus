"use client";

import Link from "next/link";

import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/public/site-footer";
import { useLanguage } from "@/contexts/LanguageContext";

type NavCard = {
  title: string;
  description: string;
  href: string;
};

const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Expertise", href: "/expertise" },
  { label: "Our Work", href: "/work" },
  { label: "Knowledge Center", href: "/knowledge-center" },
  { label: "Publications", href: "/publications" },
  { label: "Insights", href: "/insights" },
  { label: "Events", href: "/events" },
  { label: "Career", href: "/career" },
] as const;

function DraftPageShell({
  eyebrow,
  title,
  description,
  cards,
  primaryCta,
  secondaryCta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  cards: NavCard[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
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
          </div>
        </section>

        <section className="relative px-4 pb-8 pt-4 sm:px-6">
          <SiteFooter />
        </section>
      </main>
    </>
  );
}

export function ExpertiseDraftPage() {
  const { t } = useLanguage();
  const cards = t<Array<{ title: string; desc: string }>>("expertise.items")
    .slice(0, 6)
    .map((item) => ({
      title: item.title,
      description: item.desc,
      href: "/work",
    }));

  return (
    <DraftPageShell
      eyebrow={String(t("expertise.header"))}
      title="Turning evidence and collaboration into policy outcomes that scale"
      description={String(t("expertise.description"))}
      cards={cards}
      primaryCta={{ label: "See Our Work", href: "/work" }}
      secondaryCta={{ label: "Read Insights", href: "/insights" }}
    />
  );
}

export function WorkDraftPage() {
  const { t } = useLanguage();
  const cards = t<Array<{ title: string; desc: string }>>("approach.items")
    .slice(0, 4)
    .map((item) => ({
      title: item.title,
      description: item.desc,
      href: "/knowledge-center",
    }));

  return (
    <DraftPageShell
      eyebrow="OUR WORK"
      title="Delivery-focused programs from strategic design to implementation support"
      description={String(t("approach.description"))}
      cards={cards}
      primaryCta={{ label: "Open Knowledge Center", href: "/knowledge-center" }}
      secondaryCta={{ label: "Browse Events", href: "/events" }}
    />
  );
}

export function KnowledgeCenterDraftPage() {
  const { t } = useLanguage();
  const cards = t<Array<{ title: string; preview: string }>>("knowledge.items")
    .slice(0, 6)
    .map((item) => ({
      title: item.title,
      description: item.preview,
      href: "/insights",
    }));

  return (
    <DraftPageShell
      eyebrow={String(t("knowledge.header"))}
      title="A curated hub of practical policy resources and field-ready evidence"
      description={String(t("knowledge.description"))}
      cards={cards}
      primaryCta={{ label: "Read Latest Insights", href: "/insights" }}
      secondaryCta={{ label: "See Publications", href: "/publications" }}
    />
  );
}

export function PublicationsDraftPage() {
  const { t } = useLanguage();
  const cards = t<Array<{ title: string; excerpt: string }>>("insights.items")
    .slice(0, 3)
    .map((item, index) => ({
      title: `Publication Brief ${index + 1}: ${item.title}`,
      description: item.excerpt,
      href: "/insights",
    }));

  return (
    <DraftPageShell
      eyebrow="PUBLICATIONS"
      title="Research notes, policy briefs, and implementation playbooks"
      description="Draft publications page aligned with the landing narrative: rigorous evidence, practical translation, and implementation relevance."
      cards={cards}
      primaryCta={{ label: "Read Insights", href: "/insights" }}
      secondaryCta={{ label: "View Expertise", href: "/expertise" }}
    />
  );
}

export function InsightsDraftPage() {
  const { t } = useLanguage();
  const cards = t<Array<{ title: string; excerpt: string }>>("insights.items")
    .slice(0, 6)
    .map((item) => ({
      title: item.title,
      description: item.excerpt,
      href: "/insights",
    }));

  return (
    <DraftPageShell
      eyebrow={String(t("insights.header"))}
      title="Fresh analysis for policy leaders, practitioners, and delivery teams"
      description="Draft insights hub connected to events, publications, and expertise pages for smooth exploration."
      cards={cards}
      primaryCta={{ label: "See Upcoming Events", href: "/events" }}
      secondaryCta={{ label: "Open Knowledge Center", href: "/knowledge-center" }}
    />
  );
}

export function EventsDraftPage() {
  const { t } = useLanguage();
  const cards = t<Array<{ title: string; date: string; location: string }>>("events.items")
    .slice(0, 6)
    .map((item) => ({
      title: item.title,
      description: `${item.date} — ${item.location}`,
      href: "/events",
    }));

  return (
    <DraftPageShell
      eyebrow={String(t("events.header"))}
      title="Convenings, workshops, and roundtables that move policy into action"
      description="Draft events page connected to insights and knowledge content so users can continue discovery without dead-ends."
      cards={cards}
      primaryCta={{ label: "Read Related Insights", href: "/insights" }}
      secondaryCta={{ label: "View Our Work", href: "/work" }}
    />
  );
}

export function CareerDraftPage() {
  const cards: NavCard[] = [
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

  return (
    <DraftPageShell
      eyebrow="CAREER"
      title="Join a mission-driven team shaping better policy outcomes"
      description="Draft career page connected to the broader site journey, with direct paths to expertise, work, and company background."
      cards={cards}
      primaryCta={{ label: "Learn About Us", href: "/about" }}
      secondaryCta={{ label: "Explore Our Expertise", href: "/expertise" }}
    />
  );
}

