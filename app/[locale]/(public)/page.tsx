"use client";

import { motion } from "framer-motion";
import { AboutSection } from "@/components/public/about";
import { ApproachSection } from "@/components/public/Approach";
import { ExpertiseSection } from "@/components/public/Expertise";
import { KnowledgeCenterSection } from "@/components/public/KnowledgeCenter";
import { LatestInsights } from "@/components/public/LatestInsights";
import { MethodologySection } from "@/components/public/Methodology";
import { Partners } from "@/components/public/Partners";
import { Testimonials } from "@/components/public/Testimonials";
import { UpcomingEvents } from "@/components/public/UpcomingEvents";
import { PublicHeroSection } from "@/components/public/hero-section";
import { Button } from "@/components/ui/button";
import {
  SECTION_HEADER,
  SECTION_SCROLL_BODY,
  SECTION_SCROLL_STYLE,
  SNAP_SECTION,
} from "@/lib/section-shell";
import { cn } from "@/lib/utils";

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

export default function PublicHomePage() {
  return (
    <div className="relative h-[100svh] w-full bg-white text-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-br from-zinc-50 via-white to-zinc-100"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[size:18px_18px] opacity-45"
      />

      <main
        className="h-[100svh] w-full overflow-x-hidden overflow-y-auto scroll-smooth hide-scrollbar snap-y snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <PublicHeroSection />
        <AboutSection />

        <ExpertiseSection />

        <ApproachSection />

        <MethodologySection />

        <KnowledgeCenterSection />

        <Testimonials />

        <Partners />

        <UpcomingEvents />

        <LatestInsights />

        <section className={`${SNAP_SECTION} isolate`}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-[25] bg-black"
          />

          <header className={cn(SECTION_HEADER, "text-white")}>
            <motion.div {...reveal} className="w-full">
              <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                <div className="text-center lg:text-left">
                  <p className="text-xs font-semibold tracking-[0.18em] text-yellow-400 uppercase">
                    Final Call To Action
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
                    Ready to drive meaningful social impact?
                  </h2>
                </div>
                <Button className="h-11 w-full shrink-0 rounded-full bg-yellow-500 px-6 font-semibold text-black hover:bg-yellow-400 md:w-auto">
                  Get In Touch
                </Button>
              </div>
            </motion.div>
          </header>

          <div
            className={cn(SECTION_SCROLL_BODY, "lg:justify-start")}
            style={SECTION_SCROLL_STYLE}
          >
            <footer className="mt-auto w-full shrink-0 border-t border-gray-800 px-6 pt-8 pb-6">
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
        </section>
      </main>
    </div>
  );
}
