import { connectToDB } from "@/lib/db";
import BannerModel from "@/lib/models/Banner";
import ShoppingItem from "@/lib/models/ShoppingItem";
import Program from "@/lib/models/Program";
import { ensureDefaultPrograms } from "@/lib/programDefaults";
import { withCache } from "@/lib/server-cache";

export type HomeBanner = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  active: boolean;
  order?: number;
  intervalSec?: number;
};

async function ensureBannersSeeded() {
  const count = await BannerModel.countDocuments();
  if (count > 0) return;
  await BannerModel.insertMany([
    {
      title: { mn: "Shoebox Project Mongolia", en: "Shoebox Project Mongolia" },
      subtitle: {
        mn: "Хуучин гутлын хайрцагтаа ид шид бүтээ",
        en: "Create magic in your old shoebox",
      },
      image: "/banners/shoebox-project.png",
      link: "/events",
      active: true,
      order: 0,
      intervalSec: 8,
    },
    {
      title: { mn: "Сайн дурын үйлс", en: "Inspiration in Action" },
      subtitle: {
        mn: "Жижиг үйлдэл — том өөрчлөлт",
        en: "Small actions, big differences",
      },
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80",
      link: "/about",
      active: true,
      order: 1,
      intervalSec: 8,
    },
  ]);
}

export async function getHomeBanners(locale: string): Promise<HomeBanner[]> {
  return withCache(`home:banners:${locale}`, 60_000, async () => {
    await connectToDB();
    await ensureBannersSeeded();
    const docs = await BannerModel.find({ active: true }).sort({ order: 1, createdAt: -1 }).lean();
    return docs.map((b: any) => ({
      id: b._id.toString(),
      title: locale === "en" ? (b.title?.en || b.title?.mn) : b.title?.mn,
      subtitle: locale === "en" ? (b.subtitle?.en || b.subtitle?.mn) : b.subtitle?.mn,
      image: b.image,
      link: b.link || undefined,
      active: b.active,
      order: b.order,
      intervalSec: b.intervalSec || 8,
    }));
  });
}

export async function getHomeShopItems() {
  return withCache("home:shop", 90_000, async () => {
    await connectToDB();
    const items = await ShoppingItem.find({ isActive: true })
      .select("_id name price image category stock isActive createdAt")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    return items.map((item: any) => ({
      ...item,
      _id: item._id.toString(),
    }));
  });
}

export async function getHomePrograms() {
  return withCache("home:programs", 120_000, async () => {
    await connectToDB();
    await ensureDefaultPrograms();
    const programs = await Program.find({ active: true }).sort({ order: 1, code: 1 }).lean();
    return programs.map((p: any) => ({
      ...p,
      _id: p._id?.toString(),
    }));
  });
}

export async function getHomePageData(locale: string) {
  const [banners, shopItems, programs] = await Promise.all([
    getHomeBanners(locale),
    getHomeShopItems(),
    getHomePrograms(),
  ]);
  return { banners, shopItems, programs };
}
