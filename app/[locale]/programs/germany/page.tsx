import { getTranslations } from "next-intl/server";
import GermanyClient from "./GermanyClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "GermanyPage.metadata" });

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function GermanyPage() {
    return <GermanyClient />;
}
