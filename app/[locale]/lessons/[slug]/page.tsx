import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CourseClient from "./CourseClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LessonsPage.metadata" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function CoursePage() {
  return <CourseClient />;
}

