"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useTheme } from "next-themes";

import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  hasNavbarBrandingSource,
  resolveNavbarBranding,
  type NavbarBranding,
} from "@/lib/navbar-branding";
import { cn } from "@/lib/utils";

type NavLinkItem = {
  label: string;
  href: string;
};

function TextLogo({ name }: { name: string }) {
  const plusIndex = name.lastIndexOf("+");
  if (plusIndex === -1) {
    return <span className="font-semibold">{name}</span>;
  }

  const before = name.slice(0, plusIndex);
  const after = name.slice(plusIndex + 1);

  return (
    <>
      <span className="font-semibold">{before}</span>
      <span className="font-bold text-yellow-500 transition-colors duration-300">+</span>
      {after ? <span className="font-semibold">{after}</span> : null}
    </>
  );
}

export function Navbar({
  initialSettings,
}: {
  initialSettings?: Record<string, unknown>;
}) {
  const { t, locale } = useLanguage();
  const { resolvedTheme } = useTheme();
  const leftLinks = t<NavLinkItem[]>("navbar.left");
  const rightLinks = t<NavLinkItem[]>("navbar.right");
  const mobileLinks = [...leftLinks, ...rightLinks];

  const [fetchedSettings, setFetchedSettings] = React.useState<Record<string, unknown> | null>(
    null,
  );
  const [themeMounted, setThemeMounted] = React.useState(false);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setThemeMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  React.useEffect(() => {
    if (initialSettings) return;

    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => {
        if (!hasNavbarBrandingSource(payload as Record<string, unknown>)) return;
        setFetchedSettings(payload as Record<string, unknown>);
      })
      .catch(() => {});
  }, [initialSettings]);

  const settingsSource = initialSettings ?? fetchedSettings;

  const branding = React.useMemo((): NavbarBranding => {
    if (!settingsSource) {
      return { logoUrl: null, companyName: "policy+" };
    }

    const theme =
      themeMounted && (resolvedTheme === "light" || resolvedTheme === "dark")
        ? resolvedTheme
        : undefined;

    return resolveNavbarBranding(settingsSource, locale, theme);
  }, [settingsSource, locale, themeMounted, resolvedTheme]);

  const [isNavDrawerOpen, setIsNavDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isNavDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setIsNavDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isNavDrawerOpen]);

  React.useEffect(() => {
    if (isNavDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isNavDrawerOpen]);

  React.useEffect(() => {
    const onToggleNavDrawer = () => {
      setIsNavDrawerOpen((prev) => !prev);
    };
    window.addEventListener("policy:toggle-nav-drawer", onToggleNavDrawer);
    return () => window.removeEventListener("policy:toggle-nav-drawer", onToggleNavDrawer);
  }, []);

  const headerSurface = "border-b border-white/5 bg-black/60 backdrop-blur-xl";

  const logoClass = cn(
    "text-xl tracking-tight text-white transition-colors duration-300 lg:text-2xl"
  );

  const linkClass = cn(
    "text-[11px] font-medium tracking-[0.14em] transition-colors duration-300",
    "text-gray-200 hover:text-white"
  );

  const logoUrl = branding.logoUrl;
  const companyName = branding.companyName;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-50 w-full transition-colors duration-300",
          headerSurface
        )}
      >
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
            <div className="hidden flex-1 items-center justify-start gap-6 xl:gap-8 lg:flex">
            {leftLinks.map((item) => (
              <Link key={`${item.href}-${item.label}`} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className={cn("font-semibold", logoClass)}>
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={companyName}
                  width={160}
                  height={48}
                  className="h-7 w-auto max-w-[10rem] object-contain lg:h-8 lg:max-w-[12rem]"
                  priority
                />
              ) : (
                <TextLogo name={companyName} />
              )}
            </Link>
          </div>

          <div className="hidden flex-1 items-center justify-end gap-6 xl:gap-8 lg:flex">
            {rightLinks.map((item) => (
              <Link key={`${item.href}-${item.label}`} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
            <LanguageToggle overDark />
            <ThemeToggle variant="overDark" />
          </div>

          <div className="z-20 flex flex-1 lg:hidden" aria-hidden="true" />
        </div>
      </header>

      {/* Full-screen navigation drawer — mobile only */}
      <div
        className={cn(
          "fixed inset-0 z-[70] lg:hidden",
          isNavDrawerOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!isNavDrawerOpen}
        id="mobile-nav-drawer"
      >
        <div
          className={cn(
            "absolute inset-0 bg-black transition-opacity duration-300 ease-out",
            isNavDrawerOpen ? "opacity-100" : "opacity-0"
          )}
        >
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            style={{ top: "max(1rem, env(safe-area-inset-top))" }}
            aria-label="Close navigation"
            onClick={() => setIsNavDrawerOpen(false)}
          >
            <X className="size-6" />
          </button>

          <nav
            className="flex h-full flex-col items-center justify-center gap-8 px-8 pt-16"
            aria-label="Mobile primary"
          >
            {mobileLinks.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="text-center text-xl font-semibold tracking-wide text-gray-100 transition-colors hover:text-yellow-400"
                onClick={() => setIsNavDrawerOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
