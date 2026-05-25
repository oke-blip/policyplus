"use client";

import { useId, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { AboutTeamMember, AboutTeamSectionProps } from "@/components/public/about-team-section";
import { PORTRAIT_FALLBACK_BY_INDEX } from "@/components/public/about-team-portraits";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ReactNode } from "react";

function portraitSrc(member: AboutTeamMember, index: number): string {
  return (
    member.image?.trim() ||
    PORTRAIT_FALLBACK_BY_INDEX[index % PORTRAIT_FALLBACK_BY_INDEX.length]!
  );
}

function groupByCategory(members: AboutTeamMember[]) {
  const advisors: AboutTeamMember[] = [];
  const internal: AboutTeamMember[] = [];
  for (const m of members) {
    if (m.category === "advisor") advisors.push(m);
    else internal.push(m);
  }
  return { advisors, internal };
}

function AdvisorCard({ member, index }: { member: AboutTeamMember; index: number }) {
  const src = portraitSrc(member, index);
  return (
    <article className="group relative aspect-square overflow-hidden rounded-sm bg-neutral-200 dark:bg-neutral-900">
      <Image
        src={src}
        alt=""
        fill
        unoptimized={src.startsWith("data:")}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        className="object-cover transition duration-500 group-hover:scale-[1.02]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 size-10 border-b-[3px] border-r-[3px] border-yellow-500/90"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
      />
      <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-3.5">
        <p className="text-[10px] font-bold tracking-[0.12em] text-white uppercase leading-tight sm:text-[11px]">
          {member.name}
        </p>
        <p className="mt-0.5 text-[9px] leading-snug text-white/85 sm:text-[10px]">{member.role}</p>
        {member.isLeadership && member.bio?.trim() ? (
          <p className="mt-2 line-clamp-4 text-[9px] leading-relaxed text-gray-200/90 sm:text-[10px]">
            {member.bio}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function InternalCard({ member, index }: { member: AboutTeamMember; index: number }) {
  const src = portraitSrc(member, index);
  const showBio = member.isLeadership && Boolean(member.bio?.trim());

  return (
    <article className="flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        <Image
          src={src}
          alt=""
          fill
          unoptimized={src.startsWith("data:")}
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 12vw"
          className="object-cover object-top"
        />
      </div>
      <div className="mt-2 text-center">
        <p className="text-[10px] font-bold tracking-[0.1em] text-gray-900 uppercase leading-tight sm:text-[11px] dark:text-white">
          {member.name}
        </p>
        <p className="mt-0.5 text-[9px] text-gray-600 sm:text-[10px] dark:text-gray-400">{member.role}</p>
        {showBio ? (
          <p className="mt-2 text-left text-[10px] leading-relaxed text-gray-600 sm:text-xs dark:text-gray-400">
            {member.bio}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function TeamSubsection({
  title,
  children,
  headingId,
}: {
  title: string;
  children: ReactNode;
  headingId: string;
}) {
  return (
    <div className="mt-12 first:mt-10 sm:mt-14 first:sm:mt-12">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-px w-8 bg-yellow-500/80" aria-hidden />
        <h3 id={headingId} className="text-lg font-semibold tracking-wide text-yellow-600 sm:text-xl dark:text-yellow-500/95">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

/** Client layout: Advisor grid + Internal Team grid (default). */
export function AboutTeamSectionModern({
  eyebrow,
  heading,
  sub,
  joinCta,
  members,
}: AboutTeamSectionProps) {
  const groupId = useId();
  const { t } = useLanguage();
  const advisorTitle = String(t("aboutPage.teamAdvisorHeading"));
  const internalTitle = String(t("aboutPage.teamInternalHeading"));

  const { advisors, internal } = useMemo(() => groupByCategory(members), [members]);

  if (!members.length) return null;

  let advisorFallbackIndex = 0;
  let internalFallbackIndex = advisors.length;

  return (
    <section
      id="meet-the-team"
      className="relative w-full shrink-0 snap-start bg-gray-50 dark:bg-black"
      aria-labelledby={`${groupId}-team-heading`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[15%] top-[10%] h-[40vh] w-[50vw] max-w-md rounded-full bg-yellow-500/[0.05] blur-[100px]" />
      </div>

      <div className="relative z-10 px-4 pb-16 pt-28 sm:px-6 lg:pb-20 lg:pt-32">
        <header className="mx-auto max-w-7xl text-center lg:text-left">
          <p className="text-xs font-semibold tracking-[0.32em] text-yellow-600 uppercase dark:text-yellow-500">{eyebrow}</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2
              id={`${groupId}-team-heading`}
              className="text-3xl font-bold leading-[1.1] text-gray-900 sm:text-4xl lg:text-5xl dark:text-white"
            >
              {heading}
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-gray-600 lg:max-w-md lg:pb-1 lg:text-right lg:text-base dark:text-gray-400">
              {sub}
            </p>
          </div>
        </header>

        <div className="mx-auto mt-8 max-w-7xl sm:mt-10">
          {advisors.length > 0 ? (
            <TeamSubsection
              title={advisorTitle}
              headingId={`${groupId}-advisors-heading`}
            >
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
                {advisors.map((member) => {
                  const idx = advisorFallbackIndex++;
                  const key = member.id ?? `${member.name}-advisor-${idx}`;
                  return (
                    <li key={key}>
                      <AdvisorCard member={member} index={idx} />
                    </li>
                  );
                })}
              </ul>
            </TeamSubsection>
          ) : null}

          {internal.length > 0 ? (
            <TeamSubsection
              title={internalTitle}
              headingId={`${groupId}-internal-heading`}
            >
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:gap-5">
                {internal.map((member) => {
                  const idx = internalFallbackIndex++;
                  const key = member.id ?? `${member.name}-internal-${idx}`;
                  return (
                    <li key={key}>
                      <InternalCard member={member} index={idx} />
                    </li>
                  );
                })}
              </ul>
            </TeamSubsection>
          ) : null}

          <div className="mt-12 flex justify-center lg:justify-start">
            <Link
              href="/career"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-yellow-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-yellow-400"
            >
              {joinCta}
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
