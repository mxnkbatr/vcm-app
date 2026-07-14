import { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "mn"
        ? "Нууцлалын бодлого – Volunteer Mongolia"
        : "Privacy Policy – Volunteer Mongolia",
    description:
      locale === "mn"
        ? "Volunteer Center Mongolia (VCM) апп болон вэбсайтын нууцлалын бодлого."
        : "Privacy policy for the Volunteer Center Mongolia (VCM) app and website.",
  };
}

export default function PrivacyPage() {
  return <PrivacyClient />;
}
