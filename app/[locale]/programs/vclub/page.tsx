import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import VClubClient from "./VClubClient";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
   const t = await getTranslations({ locale, namespace: "VClubPage.metadata" });
   return {
      title: t("title"),
      description: t("description")
   };
}

export default function VClubProgramPage() {
   return <VClubClient />;
}
