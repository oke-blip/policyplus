"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <div className="flex w-full flex-col font-sans">
      <div className="flex flex-col items-center justify-center px-6 py-12 lg:py-16">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-yellow-400 uppercase">
              {t("aboutPage.footerEyebrow")}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
              {t("aboutPage.footerTitle")}
            </h2>
          </div>
          <Button className="h-auto w-full max-w-xs rounded-full bg-yellow-500 px-8 py-4 text-base font-bold text-black shadow-[0_10px_30px_rgba(234,179,8,0.3)] transition-all duration-300 hover:bg-yellow-400 hover:shadow-[0_14px_34px_rgba(234,179,8,0.38)] sm:max-w-sm sm:text-lg md:w-auto md:max-w-none md:px-10 md:py-5 md:text-xl">
            {t("aboutPage.footerCta")}
          </Button>
        </div>
      </div>

      <footer className="mt-auto w-full shrink-0 border-t border-gray-800 px-6 pb-6 pt-8">
        <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-4 md:gap-10">
          <div>
            <h3 className="text-base font-semibold text-white">Address & Contact</h3>
            <p className="mt-3 text-sm leading-7 text-gray-400">
              Eco-S Sahid Sudirman, Jakarta
              <br />
              hello@policyplus.id
              <br />
              +62 21 0000 0000
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Our Expertise</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li>Research & Analysis</li>
              <li>Stakeholder Engagement</li>
              <li>Project Management</li>
              <li>Strategy & Training</li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">About Us</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li>Our Story</li>
              <li>Team</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Follow Us</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li>LinkedIn</li>
              <li>Instagram</li>
              <li>YouTube</li>
              <li>X / Twitter</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl border-t border-gray-800 pt-5 text-center text-sm text-gray-500">
          © 2026 Policy+ All rights reserved
        </div>
      </footer>
    </div>
  );
}
