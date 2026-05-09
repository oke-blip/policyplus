"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { asArray, cn } from "@/lib/utils";

type NavLinkItem = {
  label: string;
  href: string;
};

export function Navbar() {
  const { t } = useLanguage();
  const leftLinks = asArray<NavLinkItem>(t("navbar.left"));
  const rightLinks = asArray<NavLinkItem>(t("navbar.right"));
  const mobileLinks = [...leftLinks, ...rightLinks];

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

  const headerSurface = "border-b border-white/5 bg-black/60 backdrop-blur-xl";

  const logoClass = cn(
    "text-xl tracking-tight text-white transition-colors duration-300 lg:text-2xl"
  );

  const linkClass = cn(
    "text-[11px] font-medium tracking-[0.14em] transition-colors duration-300",
    "text-gray-200 hover:text-white"
  );

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
            {leftLinks.map((item, index) => (
              <Link key={`nav-left-${index}`} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className={cn("font-semibold", logoClass)}>
              <span className="font-semibold">policy</span>
              <span className="font-bold text-yellow-500 transition-colors duration-300">
                +
              </span>
            </Link>
          </div>

          <div className="hidden flex-1 items-center justify-end gap-6 xl:gap-8 lg:flex">
            {rightLinks.map((item, index) => (
              <Link key={`nav-right-${index}`} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
            <LanguageToggle overDark />
            <ThemeToggle variant="overDark" />
          </div>

          <div className="z-20 flex flex-1 items-center justify-end lg:hidden">
            <button
              type="button"
              aria-label="Open navigation menu"
              className="inline-flex size-11 items-center justify-center rounded-full border border-gray-700 bg-black text-white transition-colors hover:bg-gray-900"
              onClick={() => setIsNavDrawerOpen(true)}
            >
              <Menu className="size-5" />
            </button>
          </div>
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
            {mobileLinks.map((item, index) => (
              <Link
                key={`nav-mobile-${index}`}
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
