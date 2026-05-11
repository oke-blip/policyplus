import { Navbar } from "@/components/Navbar";
import { AboutFullPage } from "@/components/public/about-full-page";
import { SiteFooter } from "@/components/public/site-footer";

/** Fixed navigation + scroll-snap About page (final section includes CTA + site footer). */
export default function AboutPage() {
  return (
    <>
      <Navbar />
      <AboutFullPage footer={<SiteFooter />} />
    </>
  );
}
