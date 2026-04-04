import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AndClient from "./AndClient";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
   const t = await getTranslations({ locale, namespace: "AndPage.metadata" });
   return {
      title: t("title"),
      description: t("description")
   };
}

export default function AndProgramPage() {
   return <AndClient />;
}
