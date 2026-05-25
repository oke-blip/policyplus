"use client";

import type { ReactNode } from "react";

type PublicSectionHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Optional row below description (filters, search, stats). */
  children?: ReactNode;
  className?: string;
};

export function PublicSectionHero({
  eyebrow,
  title,
  description,
  children,
  className = "",
}: PublicSectionHeroProps) {
  return (
    <header
      className={`relative mb-12 border-b border-white/10 pb-12 sm:mb-14 sm:pb-14 lg:mb-16 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 right-0 -z-10 h-48 w-48 rounded-full bg-yellow-500/10 blur-[80px] sm:h-64 sm:w-64"
      />
      {eyebrow?.trim() ? (
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-500 sm:text-sm">
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={`max-w-4xl text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl${eyebrow?.trim() ? " mt-4" : ""}`}
      >
        {title}
      </h1>
      {description ? (
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-8">{children}</div> : null}
    </header>
  );
}
