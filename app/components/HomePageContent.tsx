"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/hooks/useSession";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { Link } from "@/navigation";
import {
  Users, ShoppingBag, BookOpen, Ticket, ClipboardList, LayoutGrid, Search,
} from "lucide-react";
import { BRAND } from "@/lib/branding";
import PremiumPageShell from "./PremiumPageShell";
import HomeUpcomingEvents from "./HomeUpcomingEvents";
import IOSLargeTitle from "./ui/IOSLargeTitle";
import TodayCard from "./ui/TodayCard";
import FitnessRing from "./ui/FitnessRing";
import { type ProgramId } from "@/lib/color-system";
import { isNativeApp } from "@/lib/native-perf";
import { staggerContainer, staggerItem } from "@/lib/motion";
import ProgramGlyph from "./ui/ProgramGlyph";
import { IOSList, IOSListRow } from "./ui/IOSList";

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

export default function HomePageContent({
  shopItems,
  initialPrograms,
  initialBanners,
  locale,
}: {
  shopItems?: any[];
  initialBanners?: any[];
  initialPrograms?: any[];
  locale?: string;
}) {
  const mapPrograms = (data: any[]) =>
    data.map((p: any) => {
      const raw = String(p.slug || p.code?.toLowerCase() || "edu");
      const slug: ProgramId = raw === "and" || raw === "vclub" ? raw : "edu";
      return {
        id: slug,
        slug,
        label: p.name?.mn || p.code,
        sub: p.description?.mn || "",
        href: p.href || `/programs/${slug}`,
      };
    });

  const [items] = useState<any[]>(shopItems || []);
  const [programs] = useState(() =>
    initialPrograms?.length ? mapPrograms(initialPrograms) : FALLBACK_PROGRAMS
  );
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [nativeApp, setNativeApp] = useState(false);
  const { data: session, status } = useSession();
  const isSignedIn = mounted && status === "authenticated";
  const { data: dash } = useDashboard({ enabled: isSignedIn });

  useEffect(() => {
    setMounted(true);
    setNativeApp(isNativeApp());
  }, []);

  const quick = nativeApp
    ? [NAV_GRID[0], NAV_GRID[1], NAV_GRID[4], NAV_GRID[5]]
    : NAV_GRID.slice(0, 4);

  const q = query.trim().toLowerCase();
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
    if (banner) {
      return {
        title: banner.title || "Онцлох боломж",
        subtitle: banner.subtitle || BRAND.taglineMn,
        image: banner.image as string | undefined,
        href: banner.link || "/programs",
      };
    }
    const program = programs[0];
    return {
      title: program?.label || "Сайн дурын ажил",
      subtitle: program?.sub || BRAND.taglineMn,
      image: undefined,
      href: program?.href || "/programs",
    };
  }, [initialBanners, programs]);

  const apps = dash?.applications?.length ?? 0;
  const events = dash?.attendedEvents?.length ?? 0;
  const lessons = dash?.lmsEnrollments?.length ?? dash?.enrolledLessons?.length ?? 0;

  return (
    <PremiumPageShell className="home-dash" padded>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
        <motion.div variants={staggerItem}>
          <IOSLargeTitle title={greeting}>
            <p className="ios-footnote mt-1">{BRAND.taglineMn}</p>
          </IOSLargeTitle>
        </motion.div>

        <motion.div variants={staggerItem}>
          <label className="vcm-search flex items-center gap-2 h-11 px-3 rounded-[12px] bg-[var(--card)] border-[0.5px] border-[var(--sep)]">
            <Search size={18} strokeWidth={1.75} color="var(--label2)" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Хайх"
              aria-label="Хайх"
              className="flex-1 bg-transparent outline-none text-[17px] text-[var(--label)] placeholder:text-[var(--label2)]"
            />
          </label>
        </motion.div>

        <motion.div variants={staggerItem}>
          <TodayCard
            href={featured.href}
            title={featured.title}
            subtitle={featured.subtitle}
            image={featured.image}
            layoutId="today-featured"
          />
        </motion.div>

        {isSignedIn && (
          <motion.section variants={staggerItem} className="bg-[var(--card)] rounded-[20px] p-4">
            <p className="ios-headline mb-3">Таны явц</p>
            <FitnessRing
              rings={[
                { value: apps, max: Math.max(3, apps), color: "#1E5BD8", label: "Өргөдөл" },
                { value: events, max: Math.max(5, events), color: "#34C759", label: "Эвент" },
                { value: lessons, max: Math.max(4, lessons), color: "#FF9F0A", label: "Сургалт" },
              ]}
            />
            {!apps && !events && (
              <Link href="/programs/apply" className="btn btn-primary mt-4 inline-flex w-full items-center justify-center">
                Эхлэх
              </Link>
            )}
          </motion.section>
        )}

        <motion.section variants={staggerItem}>
          <div className="ios-quick">
            {quick.map(({ id, href, label, icon: Icon }) => (
              <Link key={id} href={href} className="ios-quick__item press">
                <span className="ios-quick__icon">
                  <Icon size={22} strokeWidth={1.75} />
                </span>
                <span className="ios-quick__label">{label}</span>
              </Link>
            ))}
          </div>
        </motion.section>

        <motion.section variants={staggerItem}>
          <div className="flex items-end justify-between mb-3">
            <h2 className="ios-title" style={{ fontSize: 22 }}>Удахгүй болох эвент</h2>
            <Link href="/events" className="ios-footnote" style={{ color: "var(--blue)", fontWeight: 600 }}>
              Бүгд
            </Link>
          </div>
          <HomeUpcomingEvents limit={8} query={q} />
        </motion.section>

        <motion.section variants={staggerItem}>
          <div className="flex items-end justify-between mb-3">
            <h2 className="ios-title" style={{ fontSize: 22 }}>Хөтөлбөр</h2>
            <Link href="/programs" className="ios-footnote" style={{ color: "var(--blue)", fontWeight: 600 }}>
              Бүгд
            </Link>
          </div>
          <IOSList>
            {shownPrograms.map((a) => (
              <IOSListRow
                key={a.id}
                href={a.href}
                icon={<ProgramGlyph id={a.slug || a.id} size={16} />}
                title={a.label}
                subtitle={a.sub}
              />
            ))}
            <IOSListRow
              href="/programs/apply"
              icon={<ClipboardList size={16} strokeWidth={1.75} />}
              title="Нэгдэх"
              subtitle="Өргөдөл илгээх"
            />
          </IOSList>
        </motion.section>

        {!nativeApp && items.length > 0 && locale && (
          <motion.section variants={staggerItem}>
            <div className="flex items-end justify-between mb-3">
              <h2 className="ios-title" style={{ fontSize: 22 }}>Дэлгүүр</h2>
              <Link href="/shop" className="ios-footnote" style={{ color: "var(--blue)", fontWeight: 600 }}>
                Бүгд
              </Link>
            </div>
            <ShopClient items={items} locale={locale} embedded />
          </motion.section>
        )}

        <footer className="pt-2 pb-4 text-center">
          <p className="ios-footnote">{BRAND.name}</p>
          <Link href="/about" className="inline-flex min-h-[44px] items-center ios-footnote" style={{ color: "var(--blue)", fontWeight: 600 }}>
            Тухай
          </Link>
        </footer>
      </motion.div>
    </PremiumPageShell>
  );
}
