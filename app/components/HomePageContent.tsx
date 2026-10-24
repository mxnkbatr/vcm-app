"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSession } from "@/lib/hooks/useSession";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { Link } from "@/navigation";
import { ClipboardList } from "lucide-react";
import { BRAND } from "@/lib/branding";
import PremiumPageShell from "./PremiumPageShell";
import PremiumSectionHeader from "./PremiumSectionHeader";
import HomeUpcomingEvents from "./HomeUpcomingEvents";
import HomeHeroCarousel from "./HomeHeroCarousel";
import IOSLargeTitle from "./ui/IOSLargeTitle";
import FitnessRing from "./ui/FitnessRing";
import StatCards from "./ui/StatCards";
import { type ProgramId } from "@/lib/color-system";
import { isNativeApp } from "@/lib/native-perf";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { personalGreetingMn } from "@/lib/greeting";
import { isVisibleShopItem } from "./ShopProductCard";
import {
  normalizeProgramDisplayName,
  programSlugKey,
} from "@/lib/programLabels";

const ShopClient = dynamic(() => import("@/app/[locale]/shop/ShopClient"), { ssr: false });

const FALLBACK_PROGRAMS = [
  { id: "edu", slug: "edu", label: "EDU", sub: "Сургуульд заалт", href: "/programs/edu", image: "" },
  { id: "and", slug: "and", label: "АНД", sub: "Нийгмийн халамж", href: "/programs/and", image: "" },
  { id: "vclub", slug: "vclub", label: "V-Club", sub: "Олон улсын сүлжээ", href: "/programs/vclub", image: "" },
];

const BENTO_TINT: Record<string, string> = {
  edu: "linear-gradient(145deg, rgba(30,91,216,0.55), rgba(24,72,168,0.75))",
  and: "linear-gradient(145deg, rgba(52,199,89,0.45), rgba(30,91,216,0.65))",
  vclub: "linear-gradient(145deg, rgba(175,82,222,0.5), rgba(30,91,216,0.7))",
};

type ProgramApi = {
  slug?: string;
  code?: string;
  name?: { mn?: string };
  description?: { mn?: string };
  href?: string;
  image?: string;
  emoji?: string;
};

type BannerApi = {
  _id?: string;
  id?: string;
  title?: string | { mn?: string };
  subtitle?: string | { mn?: string };
  image?: string;
  link?: string;
};

function subscribeClient(onStoreChange: () => void) {
  onStoreChange();
  return () => {};
}

export default function HomePageContent({
  shopItems,
  initialPrograms,
  initialBanners,
  locale,
}: {
  shopItems?: unknown[];
  initialBanners?: BannerApi[];
  initialPrograms?: ProgramApi[];
  locale?: string;
}) {
  const mapPrograms = (data: ProgramApi[]) =>
    data.map((p) => {
      const raw = String(p.slug || p.code?.toLowerCase() || "edu");
      const slug = programSlugKey(raw) as ProgramId;
      return {
        id: slug,
        slug,
        label: normalizeProgramDisplayName(p.name?.mn || p.code, slug, "mn"),
        sub: p.description?.mn || "",
        href: p.href || `/programs/${slug}`,
        image: p.image || "",
      };
    });

  const [items] = useState(() =>
    (shopItems || []).filter((item) => isVisibleShopItem(item, locale || "mn"))
  );
  const [programs] = useState(() => {
    const mapped = initialPrograms?.length ? mapPrograms(initialPrograms) : FALLBACK_PROGRAMS;
    // Prefer core VCM programs for bento; fall back to first 3
    const core = ["edu", "and", "vclub"]
      .map((id) => mapped.find((p) => p.id === id || p.slug === id))
      .filter(Boolean) as typeof mapped;
    return core.length >= 2 ? core.slice(0, 3) : mapped.slice(0, 3);
  });
  const mounted = useSyncExternalStore(subscribeClient, () => true, () => false);
  const nativeApp = mounted && isNativeApp();
  const { data: session, status } = useSession();
  const isSignedIn = mounted && status === "authenticated";
  const { data: dash } = useDashboard({ enabled: isSignedIn });

  const name =
    (session?.user as { name?: string } | undefined)?.name ||
    dash?.user?.fullName ||
    "";
  const greeting = personalGreetingMn(name);

  const featured = useMemo(() => {
    const banner = initialBanners?.[0];
    const asText = (v: string | { mn?: string } | undefined, fallback: string) =>
      typeof v === "string" ? v : v?.mn || fallback;
    if (banner) {
      return {
        title: asText(banner.title, "Онцлох боломж"),
        subtitle: asText(banner.subtitle, BRAND.taglineMn),
        image: banner.image,
        href: banner.link || "/programs/apply",
      };
    }
    const program = programs[0];
    return {
      title: program?.label || "Сайн дурын ажил",
      subtitle: program?.sub || BRAND.taglineMn,
      image: program?.image || undefined,
      href: "/programs/apply",
    };
  }, [initialBanners, programs]);

  const apps = dash?.applications?.length ?? 0;
  const events = dash?.attendedEvents?.length ?? 0;
  const lessons = dash?.lmsEnrollments?.length ?? dash?.enrolledLessons?.length ?? 0;
  const showShop = !nativeApp && items.length > 0 && !!locale;

  const heroBanners = useMemo(
    () =>
      (initialBanners || []).map((b) => ({
        _id: b._id || b.id,
        title: typeof b.title === "string" ? b.title : b.title?.mn,
        subtitle: typeof b.subtitle === "string" ? b.subtitle : b.subtitle?.mn,
        image: b.image,
        link: b.link,
      })),
    [initialBanners]
  );

  const edu = programs.find((p) => p.id === "edu" || p.slug === "edu") || programs[0];
  const rest = programs.filter((p) => p !== edu).slice(0, 2);

  return (
    <PremiumPageShell className="home-dash home-dash--wow" padded={false}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="home-sections home-sections--wow">
        {/* Greeting lives in AppHeader — keep for a11y / title sync only */}
        <IOSLargeTitle title={greeting} />

        <motion.div variants={staggerItem} className="home-hero-wrap">
          <HomeHeroCarousel banners={heroBanners} fallback={featured} />
        </motion.div>

        <div className="ios-page__pad home-sections home-sections--body">
          <motion.section variants={staggerItem}>
            <StatCards
              stats={[
                { value: 10000, suffix: "+", label: "Сайн дурынхан" },
                { value: 50, suffix: "+", label: "Төсөл" },
                { value: 3, label: "Хөтөлбөр" },
              ]}
            />
          </motion.section>

          {isSignedIn && (
            <motion.section variants={staggerItem} className="ios-frost-section glass-surface">
              <p className="ios-headline mb-3">Таны явц</p>
              <FitnessRing
                rings={[
                  { value: apps, max: Math.max(3, apps), color: "#1E5BD8", label: "Өргөдөл" },
                  { value: events, max: Math.max(5, events), color: "#34C759", label: "Эвент" },
                  { value: lessons, max: Math.max(4, lessons), color: "#FF9F0A", label: "Сургалт" },
                ]}
              />
              {!apps && !events && (
                <Link href="/programs/apply" prefetch className="btn btn-primary glass-press mt-4 inline-flex w-full items-center justify-center">
                  Эхлэх
                </Link>
              )}
            </motion.section>
          )}

          <motion.section variants={staggerItem}>
            <PremiumSectionHeader title="Удахгүй болох эвент" href="/events" />
            <HomeUpcomingEvents limit={8} />
          </motion.section>

          <motion.section variants={staggerItem}>
            <PremiumSectionHeader title="Хөтөлбөрүүд" href="/programs" />
            <div className="home-bento">
              {edu ? (
                <Link href={edu.href} prefetch className="home-bento__hero press glass-press">
                  {edu.image ? (
                    <Image src={edu.image} alt={edu.label} fill className="object-cover" sizes="(max-width:520px) 100vw, 480px" />
                  ) : (
                    <div className="home-bento__fallback" />
                  )}
                  <div className="home-bento__tint" style={{ background: BENTO_TINT.edu }} />
                  <div className="home-bento__copy">
                    <p className="home-bento__code">EDU</p>
                    <h3 className="home-bento__title">{edu.label}</h3>
                    <p className="home-bento__sub">{edu.sub}</p>
                  </div>
                </Link>
              ) : null}
              <div className="home-bento__stack">
                {rest.map((p) => (
                  <Link key={p.id} href={p.href} prefetch className="home-bento__tile press glass-press">
                    {p.image ? (
                      <Image src={p.image} alt={p.label} fill className="object-cover" sizes="240px" />
                    ) : (
                      <div className="home-bento__fallback" />
                    )}
                    <div
                      className="home-bento__tint"
                      style={{ background: BENTO_TINT[p.id] || BENTO_TINT.vclub }}
                    />
                    <div className="home-bento__copy">
                      <p className="home-bento__code">{p.id.toUpperCase()}</p>
                      <h3 className="home-bento__title">{p.label}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/programs/apply" prefetch className="home-join-chip glass-surface press mt-3 inline-flex items-center gap-2">
              <ClipboardList size={16} strokeWidth={1.75} />
              Нэгдэх — өргөдөл илгээх
            </Link>
          </motion.section>

          {showShop && locale && (
            <motion.section variants={staggerItem}>
              <PremiumSectionHeader title="Дэлгүүр" href="/shop" />
              <ShopClient items={items} locale={locale} embedded />
            </motion.section>
          )}

          <footer className="pt-2 pb-2 text-center">
            <p className="ios-footnote">{BRAND.name}</p>
          </footer>
        </div>
      </motion.div>
    </PremiumPageShell>
  );
}
