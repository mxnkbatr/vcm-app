import AboutClient from "./AboutClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "mn" ? "Бидний тухай – VCM" : "About Us – VCM",
    description: locale === "mn"
      ? "Монголын Сайн Дурынхны Төв – 2007 оноос хойш хүмүүнлэг нийгмийг байгуулж байна."
      : "Volunteer Center Mongolia – Building a humane society since 2007.",
  };
}

export default function AboutPage() {
  return <AboutClient />;
}
