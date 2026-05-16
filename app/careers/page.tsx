import { redirect } from "next/navigation";

/** Alias — canonical careers page is /career (navbar locale href). */
export default function CareersRedirectPage() {
  redirect("/career");
}
