"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

export function CTAFooterSection({ settings }: { settings: any }) {
  return (
    <section className="w-full snap-start bg-black">
      <div className="flex min-h-svh w-full flex-col">
        <motion.div
          {...reveal}
          className="flex flex-1 flex-col items-center justify-start px-6 pt-24 pb-8 md:justify-center md:pt-0"
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold tracking-[0.18em] text-yellow-400 uppercase">
                {settings?.cta_subtitle || "Final Call To Action"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
                {settings?.cta_title || "Ready to drive meaningful social impact?"}
              </h2>
            </div>
            <Link
              href={settings?.cta_button_link || "#"}
              className="w-full shrink-0 md:w-auto"
            >
              <Button className="h-auto min-h-[4.5rem] w-full min-w-[280px] rounded-full bg-yellow-500 px-12 py-6 text-xl font-bold tracking-wide text-black shadow-[0_12px_40px_rgba(234,179,8,0.45)] transition-all duration-300 hover:scale-[1.02] hover:bg-yellow-400 hover:shadow-[0_16px_48px_rgba(234,179,8,0.55)] sm:min-h-[5rem] sm:min-w-[320px] sm:px-14 sm:py-7 sm:text-2xl md:min-h-[5.5rem] md:min-w-[380px] md:px-16 md:py-8 md:text-3xl lg:min-w-[420px] lg:px-20 lg:py-9 lg:text-4xl">
                {settings?.cta_button_text || "Get In Touch"}
              </Button>
            </Link>
          </div>
        </motion.div>

        <footer className="mt-auto w-full shrink-0 border-t border-gray-800 px-6 pb-6 pt-8">
          <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-4 md:gap-10">
            <div>
              <h3 className="text-base font-semibold text-white">Address & Contact</h3>
              <p className="mt-3 text-sm leading-7 text-gray-400">
                {settings?.office_address || "Eco-S Sahid Sudirman, Jakarta"}
                <br />
                {settings?.email_address || "hello@policyplus.id"}
                <br />
                {settings?.phone_number || "+62 21 0000 0000"}
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
                {settings?.social_links?.length > 0
                  ? settings.social_links.map((link: any) => (
                      <li key={link.id}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white transition-colors"
                        >
                          {link.platform}
                        </a>
                      </li>
                    ))
                  : (
                    <>
                      <li>LinkedIn</li>
                      <li>Instagram</li>
                      <li>YouTube</li>
                      <li>X / Twitter</li>
                    </>
                  )}
              </ul>
            </div>
          </div>
          <div className="mx-auto mt-8 max-w-7xl border-t border-gray-800 pt-5 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} {settings?.company_name || "Policy+"} All rights reserved
          </div>
        </footer>
      </div>
    </section>
  );
}
