"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/hooks/useSession";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { Link } from "@/navigation";
import {
  Users, ShoppingBag, BookOpen, Ticket, ClipboardList, LayoutGrid, Search,
} from "lucide-react";
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
import ProgramGlyph from "./ui/ProgramGlyph";
import { IOSList, IOSListRow } from "./ui/IOSList";
import { isVisibleShopItem } from "./ShopProductCard";
import {
  normalizeProgramDisplayName,
  programSlugKey,
} from "@/lib/programLabels";

const ShopClient = dynamic(() => import("@/app/[locale]/shop/ShopClient"), { ssr: false });

const FALLBACK_PROGRAMS = [
  { id: "edu", slug: "edu", label: "EDU", sub: "Сургуульд заалт", href: "/programs/edu" },
  { id: "and", slug: "and", label: "АНД", sub: "Нийгмийн халамж", href: "/programs/and" },
  { id: "vclub", slug: "vclub", label: "V-Club", sub: "Олон улсын сүлжээ", href: "/programs/vclub" },
];

const NAV_GRID = [
  { id: "programs", href: "/programs", label: "Хөтөлбөр", icon: Users },
  { id: "events", href: "/events", label: "Эвент", icon: Ticket },
  { id: "lessons", href: "/lessons", label: "Сургалт", icon: BookOpen },
  { id: "shop", href: "/shop", label: "Дэлгүүр", icon: ShoppingBag },
  { id: "apply", href: "/programs/apply", label: "Өргөдөл", icon: ClipboardList },
  { id: "more", href: "/about", label: "Бусад", icon: LayoutGrid },
];

type ProgramApi = {
  slug?: string;
  code?: string;
  name?: { mn?: string };
  description?: { mn?: string };
  href?: string;
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

function todayLabel() {
  try {
    return new Date().toLocaleDateString("mn-MN", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
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
      };
    });

  const [items] = useState(() =>
    (shopItems || []).filter((item) => isVisibleShopItem(item, locale || "mn"))
  );
  const [programs] = useState(() =>
    initialPrograms?.length ? mapPrograms(initialPrograms) : FALLBACK_PROGRAMS
  );
  const mounted = useSyncExternalStore(subscribeClient, () => true, () => false);
  const nativeApp = mounted && isNativeApp();
  const { data: session, status } = useSession();
  const isSignedIn = mounted && status === "authenticated";
  const { data: dash } = useDashboard({ enabled: isSignedIn });

  const quick = nativeApp
    ? [NAV_GRID[0], NAV_GRID[1], NAV_GRID[4], NAV_GRID[5]]
    : NAV_GRID.slice(0, 4);

  const q = "";
  const shownPrograms = programs.filter((p) => !q || `${p.label} ${p.sub}`.toLowerCase().includes(q));

  const name =
    (session?.user as { name?: string } | undefined)?.name ||
    dash?.user?.fullName ||
    "";

  const greeting = name
    ? `Сайн уу, ${name.split(" ")[0]}`
    : "Сайн уу";

  const featured = useMemo(() => {
    const banner = initialBanners?.[0];
    const asText = (v: string | { mn?: string } | undefined, fallback: string) =>
      typeof v === "string" ? v : v?.mn || fallback;
    if (banner) {
      return {
        title: asText(banner.title, "Онцлох боломж"),
        subtitle: asText(banner.subtitle, BRAND.taglineMn),
        image: banner.image,
        href: banner.link || "/programs",
      };
    }
    const program = programs[0];
    return {
      title: program?.label || "Сайн дурын ажил",
      subtitle: program?.sub || BRAND.taglineMn,
      image: undefined as string | undefined,
      href: program?.href || "/programs",
    };
  }, [initialBanners, programs]);

  const apps = dash?.applications?.length ?? 0;
  const events = dash?.attendedEvents?.length ?? 0;
  const lessons = dash?.lmsEnrollments?.length ?? dash?.enrolledLessons?.length ?? 0;

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

  const dateLine = todayLabel();

  return (
    <PremiumPageShell className="home-dash" padded>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="home-sections">
        <motion.div variants={staggerItem}>
          <IOSLargeTitle title={greeting}>
            <div className="home-greeting-glass">
              <p className="home-greeting-glass__date">{dateLine}</p>
              <p className="home-greeting-glass__hi">{greeting}</p>
              <p className="home-greeting-glass__sub">{BRAND.taglineMn}</p>
            </div>
          </IOSLargeTitle>
        </motion.div>

        <motion.div variants={staggerItem}>
          <button
            type="button"
            className="vcm-search ios26-search glass-chip flex items-center gap-2 w-full text-left press"
            onClick={() => window.dispatchEvent(new CustomEvent("vcm:open-search"))}
          >
            <Search size={18} strokeWidth={1.75} color="var(--label2)" />
            <span className="flex-1 text-[15px]" style={{ color: "var(--label2)" }}>
              Хайх
            </span>
          </button>
        </motion.div>

        <motion.div variants={staggerItem}>
          <HomeHeroCarousel banners={heroBanners} fallback={featured} />
        </motion.div>

        {/* Mobile quick glass chips — dock covers main tabs; these jump to key actions */}
        <motion.section variants={staggerItem} className="lg:hidden">
          <div className="ios-quick-chips">
            {quick.map(({ id, href, label, icon: Icon }) => (
              <Link key={id} href={href} prefetch className="ios-quick-chip glass-press press">
                <span className="ios-quick-chip__icon">
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <span className="ios-quick-chip__label">{label}</span>
              </Link>
            ))}
          </div>
        </motion.section>

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
          <motion.section variants={staggerItem} className="ios-frost-section">
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

        <motion.section variants={staggerItem} className="hidden lg:block">
          <div className="ios-quick">
            {quick.map(({ id, href, label, icon: Icon }) => (
              <Link key={id} href={href} prefetch className="ios-quick__item glass-press">
                <span className="ios-quick__icon">
                  <Icon size={22} strokeWidth={1.75} />
                </span>
                <span className="ios-quick__label">{label}</span>
              </Link>
            ))}
          </div>
        </motion.section>

        <motion.section variants={staggerItem}>
          <PremiumSectionHeader title="Удахгүй болох эвент" href="/events" />
          <HomeUpcomingEvents limit={8} query={q} />
        </motion.section>

        <motion.section variants={staggerItem}>
          <PremiumSectionHeader title="Хөтөлбөр" href="/programs" />
          <IOSList>
            {shownPrograms.map((a) => (
              <IOSListRow
                key={a.id}
                href={a.href}
                icon={<ProgramGlyph id={a.slug || a.id} size={22} />}
                title={a.label}
                subtitle={a.sub}
              />
            ))}
            <IOSListRow
              href="/programs/apply"
              icon={<ClipboardList size={22} strokeWidth={1.75} />}
              title="Нэгдэх"
              subtitle="Өргөдөл илгээх"
            />
          </IOSList>
        </motion.section>

        {!nativeApp && items.length > 0 && locale && (
          <motion.section variants={staggerItem}>
            <PremiumSectionHeader title="Дэлгүүр" href="/shop" />
            <ShopClient items={items} locale={locale} embedded />
          </motion.section>
        )}

        <footer className="pt-1 pb-2 text-center">
          <p className="ios-footnote">{BRAND.name}</p>
        </footer>
      </motion.div>
    </PremiumPageShell>
  );
}
