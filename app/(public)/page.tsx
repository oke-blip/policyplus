"use client";

import { motion } from "framer-motion";
import { AboutSection } from "@/components/public/about";
import { ExpertiseSection } from "@/components/public/Expertise";
import { MethodologySection } from "@/components/public/Methodology";
import { PublicHeroSection } from "@/components/public/hero-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const knowledgeItems = [
  { category: "Sustainability", title: "Advisory Initiative on Sustainable Logistics" },
  { category: "Good Governance", title: "Institutional Delivery Acceleration Program" },
  { category: "Public Policy", title: "Integrated Economic Transition Roadmap" },
];

const events = Array.from({ length: 3 }, () => ({
  day: "12",
  month: "AUG",
  title: "Reformasi atau Replikasi?",
  blurb: "A high-level dialogue on institutional reform, replication risk, and policy innovation.",
}));

const partners = ["IESR", "Coaction", "Urban Shift", "C40", "UNDP", "GIZ"];

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

export default function PublicHomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-slate-900">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-gradient-to-br from-zinc-50 via-white to-zinc-100"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(rgba(15,23,42,0.08)_1px,transparent_1px)] bg-[size:18px_18px] opacity-45"
      />

      <main>
        <PublicHeroSection />
        <AboutSection />

        <motion.section
          {...reveal}
          className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-[1.05fr_0.95fr] md:gap-20"
        >
          <div>
            <Badge>Our Focus Area</Badge>
            <h2 className="mt-5 text-balance font-serif text-4xl font-bold tracking-tight md:text-5xl">
              The complex governance challenge we solve
            </h2>
            <p className="mt-7 text-base leading-8 text-slate-600">
              Governance challenges are increasingly complex, interconnected, and dynamic.
              Institutions are expected to act faster while balancing evidence, public
              trust, and implementation realities. Policy+ supports decision-makers
              with integrated policy thinking that connects strategic vision to practical outcomes.
            </p>
          </div>
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.24 }}
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-10 shadow-[0_20px_50px_rgba(2,6,23,0.2)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(234,179,8,0.35),transparent_38%),radial-gradient(circle_at_78%_74%,rgba(255,255,255,0.12),transparent_45%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.09)_1px,transparent_1px)] bg-[size:34px_34px] opacity-50" />
            <div className="relative z-10">
              <p className="text-xs font-semibold tracking-[0.22em] text-yellow-300 uppercase">
                Strategic Insight
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-100">
                Navigating complexity requires architecture-level policy design:
                coordinated institutions, adaptive execution, and measurable public value.
              </p>
              <div className="mt-8 h-36 rounded-2xl bg-gradient-to-br from-yellow-400/30 via-white/15 to-transparent" />
            </div>
          </motion.div>
        </motion.section>

        <ExpertiseSection />

        <MethodologySection />

        <motion.section {...reveal} className="mx-auto w-full max-w-7xl px-6 py-24">
          <Badge>Knowledge Center</Badge>
          <h2 className="mt-5 font-serif text-4xl font-bold tracking-tight md:text-5xl">
            Latest policy innovations
          </h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {knowledgeItems.map((item, index) => (
              <motion.article
                key={`${item.category}-${index}`}
                whileHover={{ y: -6 }}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
              >
                <div className="h-52 bg-[linear-gradient(135deg,#0f172a_0%,#334155_55%,#facc15_160%)]" />
                <div className="p-7">
                  <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-yellow-700 uppercase">
                    {item.category}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold leading-tight text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-5 text-xs tracking-[0.12em] text-slate-400 uppercase">
                    24 Apr 2026
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section {...reveal} className="mx-auto w-full max-w-7xl px-6 py-24">
          <Badge>Events</Badge>
          <h2 className="mt-5 font-serif text-4xl font-bold tracking-tight md:text-5xl">
            Engage with us
          </h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {events.map((event, index) => (
              <motion.article
                key={`${event.title}-${index}`}
                whileHover={{ y: -6 }}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_10px_28px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-baseline gap-3">
                  <p className="text-5xl font-bold text-slate-900">{event.day}</p>
                  <p className="text-xs font-semibold tracking-[0.2em] text-yellow-600 uppercase">
                    {event.month}
                  </p>
                </div>
                <h3 className="mt-8 text-2xl font-semibold text-slate-900">
                  {event.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{event.blurb}</p>
                <Button variant="outline" className="mt-8 h-10 rounded-full border-slate-300 px-5">
                  Learn More
                </Button>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section {...reveal} className="mx-auto w-full max-w-7xl px-6 py-24">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <Badge>Testimonials</Badge>
              <h2 className="mt-5 font-serif text-4xl font-bold tracking-tight md:text-5xl">
                Trusted by changemakers
              </h2>
              <blockquote className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_14px_32px_rgba(15,23,42,0.06)]">
                <div className="mb-6 h-14 w-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600" />
                <p className="text-lg leading-9 text-slate-700">
                  &quot;Policy+ helped us move from fragmented ideas into a shared policy direction with real implementation clarity.&quot;
                </p>
                <footer className="mt-6 text-sm font-medium text-slate-900">
                  Senior Advisor, Public Institution
                </footer>
              </blockquote>
            </div>
            <div>
              <h2 className="font-serif text-4xl font-bold tracking-tight md:text-5xl">
                Partners in Impact
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {partners.map((partner) => (
                  <div
                    key={partner}
                    className="flex h-24 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold tracking-wide text-slate-400 grayscale transition-all hover:text-slate-800 hover:grayscale-0"
                  >
                    {partner}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          {...reveal}
          className="mx-auto w-full max-w-7xl rounded-3xl bg-zinc-950 px-6 py-16 text-white"
        >
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-yellow-400 uppercase">
                Final Call To Action
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Ready to drive meaningful social impact?
              </h2>
            </div>
            <Button className="h-11 rounded-full px-6 font-semibold">Get In Touch</Button>
          </div>
        </motion.section>

        <footer className="mt-24 bg-slate-100">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Address & Contact</h3>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                Eco-S Sahid Sudirman, Jakarta
                <br />
                hello@policyplus.id
                <br />
                +62 21 0000 0000
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Our Expertise</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-500">
                <li>Research & Analysis</li>
                <li>Stakeholder Engagement</li>
                <li>Project Management</li>
                <li>Strategy & Training</li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">About Us</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-500">
                <li>Our Story</li>
                <li>Team</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Follow Us</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-500">
                <li>LinkedIn</li>
                <li>Instagram</li>
                <li>YouTube</li>
                <li>X / Twitter</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 bg-slate-200/40">
            <div className="mx-auto w-full max-w-7xl px-6 py-5 text-sm text-slate-500">
              © 2026 Policy+ All rights reserved
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
