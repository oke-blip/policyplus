"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Plus, X } from "lucide-react";

import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "About Us", href: "#" },
  { label: "Our Expertise", href: "#expertise" },
  { label: "Our Work", href: "#" },
  { label: "Publications", href: "#" },
  { label: "Insights", href: "/blog" },
  { label: "Events", href: "#" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = React.useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (!isNavDrawerOpen && !isWidgetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isNavDrawerOpen) setIsNavDrawerOpen(false);
      else setIsWidgetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isNavDrawerOpen, isWidgetOpen]);

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

  const atTop = !scrolled;

  const headerSurface = atTop
    ? "border-b border-transparent bg-transparent"
    : "border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950";

  const logoClass = cn(
    "text-xl tracking-tight transition-colors duration-300 md:text-2xl",
    atTop ? "text-white" : "text-gray-900 dark:text-gray-100"
  );

  const linkClass = cn(
    "text-[11px] font-medium tracking-[0.14em] transition-colors duration-300",
    atTop
      ? "text-white hover:text-white"
      : "text-gray-900 hover:text-gray-950 dark:text-gray-100 dark:hover:text-white"
  );

  const openNavDrawer = () => {
    setIsNavDrawerOpen(true);
    setIsWidgetOpen(false);
  };

  const fabSecondaryClass =
    "inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-md transition-all duration-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-50 w-full transition-colors duration-300",
          headerSurface
        )}
      >
        <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 md:grid md:h-20 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-3">
          <Link href="/" className={cn("font-semibold md:justify-self-start", logoClass)}>
            <span className="font-semibold">policy</span>
            <span
              className={cn(
                "font-bold transition-colors duration-300",
                atTop ? "text-white" : "text-yellow-500"
              )}
            >
              +
            </span>
          </Link>

          <nav
            className="hidden justify-self-center md:flex md:items-center md:gap-7"
            aria-label="Primary"
          >
            {navLinks.map((item) => (
              <Link key={item.label} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center justify-end gap-2 justify-self-end md:flex md:gap-3">
            <LanguageToggle overDark={atTop} />
            <ThemeToggle variant={atTop ? "overDark" : "default"} />
          </div>
        </div>
      </header>

      {/* FAB widget backdrop (mobile only) */}
      {isWidgetOpen && !isNavDrawerOpen ? (
        <button
          type="button"
          aria-label="Close quick actions"
          className="fixed inset-0 z-[54] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 md:hidden"
          onClick={() => setIsWidgetOpen(false)}
        />
      ) : null}

      {/* iOS-style FAB — mobile only */}
      <div
        className={cn(
          "fixed right-6 z-[55] flex flex-col items-end gap-3 md:hidden",
          "bottom-[max(1.5rem,env(safe-area-inset-bottom))]"
        )}
      >
        <div
          className={cn(
            "flex flex-col items-end gap-3 transition-all duration-300 ease-out",
            isWidgetOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-6 opacity-0"
          )}
          aria-hidden={!isWidgetOpen}
        >
          {/* Top: theme */}
          <ThemeToggle
            variant="default"
            className={cn(fabSecondaryClass, "!size-12 border-gray-200 shadow-md")}
          />
          {/* Middle: language */}
          <LanguageToggle variant="fab" />
          {/* Bottom: hamburger → opens full-screen nav */}
          <button
            type="button"
            aria-label="Open navigation menu"
            className={fabSecondaryClass}
            onClick={openNavDrawer}
          >
            <Menu className="size-5" />
          </button>
        </div>

        <button
          type="button"
          aria-expanded={isWidgetOpen}
          aria-label={isWidgetOpen ? "Close quick actions" : "Open quick actions"}
          onClick={() => setIsWidgetOpen((o) => !o)}
          className={cn(
            "flex size-14 items-center justify-center rounded-full shadow-xl transition-transform duration-300 ease-out",
            "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100",
            isWidgetOpen && "rotate-45"
          )}
        >
          <Plus className="size-7" strokeWidth={2.2} />
        </button>
      </div>

      {/* Full-screen navigation drawer — mobile only */}
      <div
        className={cn(
          "fixed inset-0 z-[70] md:hidden",
          isNavDrawerOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!isNavDrawerOpen}
        id="mobile-nav-drawer"
      >
        <div
          className={cn(
            "absolute inset-0 bg-white transition-opacity duration-300 ease-out dark:bg-gray-950",
            isNavDrawerOpen ? "opacity-100" : "opacity-0"
          )}
        >
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
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
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-center text-xl font-semibold tracking-wide text-gray-900 transition-colors hover:text-yellow-600 dark:text-gray-100 dark:hover:text-yellow-400"
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
