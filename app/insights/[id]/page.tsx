import { Navbar } from "@/components/Navbar";
import { InsightDetailPage } from "@/components/public/InsightDetailPage";

export default async function InsightArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Navbar />
      <InsightDetailPage id={id} />
    </>
  );
}