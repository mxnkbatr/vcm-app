import HomePageContent from "@/app/components/HomePageContent";
import { getAuthSession } from "@/lib/authHelpers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage.metadata" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Use lightweight session (no DB call) — role is already in JWT
  const session = await getAuthSession();
  if (session?.role === "admin") {
    redirect(`/${locale}/admin`);
  }

  return <HomePageContent locale={locale} />;
}
