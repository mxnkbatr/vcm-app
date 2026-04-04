import { getTranslations } from "next-intl/server";
import BelgiumClient from "./BelgiumClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "BelgiumPage.metadata" });

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default function BelgiumPage() {
    return <BelgiumClient />;
}
