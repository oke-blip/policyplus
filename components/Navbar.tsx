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

/** Canonical primary nav (6 items). */
const MEGA_MENU_ITEMS: readonly { href: string; labelEn: string; labelId: string }[] = [
  { href: "/about", labelEn: "About Us", labelId: "Tentang Kami" },
  { href: "/expertise", labelEn: "Our Expertise", labelId: "Keahlian Kami" },
  { href: "/knowledge-center", labelEn: "Knowledge Center", labelId: "Pusat Pengetahuan" },
  { href: "/insights", labelEn: "Insights", labelId: "Wawasan" },
  { href: "/events", labelEn: "Events", labelId: "Acara" },
  { href: "/career", labelEn: "Careers", labelId: "Karir" },
];

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
  const { locale } = useLanguage();
  const { resolvedTheme } = useTheme();

  const megaMenuLinks = React.useMemo((): NavLinkItem[] => {
    const isId = locale === "id";
    return MEGA_MENU_ITEMS.map(({ href, labelEn, labelId }) => ({
      href,
      label: isId ? labelId : labelEn,
    }));
  }, [locale]);

  const mobileLinks = megaMenuLinks;

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

  // Perbesar ukuran font teks logo (jika tidak ada gambar)
  const logoClass = cn(
    "text-2xl tracking-tight text-white transition-colors duration-300 lg:text-3xl"
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
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          
          {/* BAGIAN KIRI: LOGO (DIBESARKAN) */}
          <div className="flex shrink-0 items-center justify-start">
            <Link href="/" className={cn("font-semibold", logoClass)}>
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={companyName}
                  width={200}
                  height={62}
                  className="h-9 w-auto max-w-[13rem] object-contain lg:h-11 lg:max-w-[15rem]"
                  priority
                />
              ) : (
                <TextLogo name={companyName} />
              )}
            </Link>
          </div>

          {/* BAGIAN KANAN: SEMUA MENU & TOGGLE */}
          <div className="hidden flex-1 items-center justify-end gap-6 xl:gap-8 lg:flex">
            {megaMenuLinks.map((item) => (
              <Link key={`${item.href}-${item.label}`} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-4 border-l border-white/10 pl-6 xl:pl-8">
              <LanguageToggle overDark />
              <ThemeToggle variant="overDark" />
            </div>
          </div>

          {/* Placeholder untuk tombol mobile menu jika ditekan dari luar */}
          <div className="z-20 flex shrink-0 lg:hidden" aria-hidden="true" />
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