import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
};

/** Legacy route — company profile CMS moved to Setting Compro. */
export default async function CompanyProfileRedirect({ params }: PageProps) {
  const { locale } = await params;
  redirect(`/${locale}/admin/settings`);
}
