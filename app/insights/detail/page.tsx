import { redirect } from "next/navigation";

export default async function InsightDetailLegacyRoute({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) {
    redirect("/insights");
  }
  redirect(`/insights/${encodeURIComponent(id)}`);
}
