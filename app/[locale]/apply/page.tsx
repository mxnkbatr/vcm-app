import { redirect } from "next/navigation";

export default async function ApplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ program?: string }>;
}) {
  const { locale } = await params;
  const { program } = await searchParams;
  const qs = program ? `?program=${encodeURIComponent(program)}` : "";
  redirect(`/${locale}/programs/apply${qs}`);
}
