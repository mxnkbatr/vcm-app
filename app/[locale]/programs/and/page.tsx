import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AndClient from "./AndClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
   const { locale } = await params;
   const t = await getTranslations({ locale, namespace: "AndPage.metadata" });
   return {
      title: t("title"),
      description: t("description")
   };
}

export default function AndProgramPage() {
   return <AndClient />;
}
