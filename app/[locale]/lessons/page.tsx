import { getTranslations } from "next-intl/server";
import LessonsClient from "./LessonsClient";
import { getTabCourses } from "@/lib/tab-data";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LessonsPage.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export const revalidate = 120;

export default async function LessonsPage() {
  const courses = await getTabCourses();
  return <LessonsClient initialCourses={courses as any} />;
}
