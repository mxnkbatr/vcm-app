import { NextResponse } from "next/server";
import { getHomeBanners } from "@/lib/home-data";

export const revalidate = 60;

const DEFAULT_BANNERS = [
  {
    id: "shoebox",
    title: "Shoebox Project Mongolia",
    subtitle: "Хуучин гутлын хайрцагтаа ид шид бүтээ",
    image: "/banners/shoebox-project.png",
    link: "/events",
    active: true,
    order: 0,
    intervalSec: 8,
  },
  {
    id: "about",
    title: "Сайн дурын үйлс",
    subtitle: "Жижиг үйлдэл — том өөрчлөлт",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80",
    link: "/about",
    active: true,
    order: 1,
    intervalSec: 8,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "mn";

  try {
    const banners = await getHomeBanners(locale);
    return NextResponse.json(
      { banners, settings: { defaultIntervalSec: 8 } },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Banner fetch error:", error);
    return NextResponse.json(
      { banners: DEFAULT_BANNERS, settings: { defaultIntervalSec: 8 } },
      { status: 200 }
    );
  }
}
