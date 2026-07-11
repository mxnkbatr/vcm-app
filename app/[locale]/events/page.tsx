import { getTranslations } from "next-intl/server";
import EventsClient from "./EventsClient";
import { getTabEvents } from "@/lib/tab-data";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "EventsPage.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export const revalidate = 45;

export default async function EventsPage() {
  const events = await getTabEvents();
  return <EventsClient initialEvents={events as any} />;
}
