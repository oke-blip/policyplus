import { redirect } from "next/navigation";

/** Legacy route — company profile CMS moved to Setting Compro. */
export default function CompanyProfileRedirect() {
  redirect("/admin/settings");
}
