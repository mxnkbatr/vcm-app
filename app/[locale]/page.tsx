import HomePageContent from "@/app/components/HomePageContent";
import { getSupabaseUser } from "@/lib/authHelpers";
import { getHomePageData } from "@/lib/home-data";
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

export const revalidate = 60;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const [supabaseUser, homeData] = await Promise.all([
    getSupabaseUser(),
    getHomePageData(locale),
  ]);

  if (supabaseUser?.user_metadata?.role === "admin") {
    redirect(`/${locale}/admin`);
  }

  return (
    <HomePageContent
      locale={locale}
      initialBanners={homeData.banners}
      shopItems={homeData.shopItems}
      initialPrograms={homeData.programs}
    />
  );
}
