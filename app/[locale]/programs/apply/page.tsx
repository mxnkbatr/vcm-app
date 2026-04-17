import { Metadata } from "next";
import ProgramsApplyClient from "./ProgramsApplyClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "mn" ? "Өргөдөл гаргах – VCM" : "Apply to program – VCM",
    description: "VCM хөтөлбөрт өргөдөл гаргах",
  };
}

export default function ProgramsApplyPage() {
  return <ProgramsApplyClient />;
}
