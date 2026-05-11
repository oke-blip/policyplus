import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Policy Plus",
  description:
    "Learn who we are and our mission: evidence-based policy in Indonesia and trusted advisory for dynamic governance.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
