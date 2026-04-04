import HomePageContent from "@/app/components/HomePageContent";
import { getAuthUser } from "@/lib/authHelpers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { connectToDB } from "@/lib/db";
import ShoppingItem from "@/lib/models/ShoppingItem";

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
  const user = await getAuthUser();

  if (user?.role === "admin") {
    redirect(`/${locale}/admin`);
  }

  await connectToDB();
  const res = await ShoppingItem.find({ isActive: true }).sort({ createdAt: -1 }).limit(12).lean();
  const items = res.map((item: any) => ({
    ...item,
    _id: item._id.toString(),
    createdAt: item.createdAt?.toISOString(),
    updatedAt: item.updatedAt?.toISOString(),
  }));

  return <HomePageContent shopItems={items} locale={locale} />;
}
