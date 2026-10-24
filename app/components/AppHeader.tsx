"use client";

import { Link, usePathname, useRouter } from "@/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Bell, Bookmark, Search, Share2,
} from "lucide-react";
import { isTabRoute, stripLocale } from "@/lib/navigation-motion";
import BrandLogo from "@/app/components/BrandLogo";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  scrolled: boolean;
  unreadCount?: number;
  avatarInitial?: string;
  /** Home tab: greeting layout instead of "Нүүр" title */
  homeMode?: boolean;
  onSearch?: () => void;
  onBell?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  bookmarked?: boolean;
};

/** Unified native header — tab (large→inline) + detail (transparent→solid). */
export default function AppHeader({
  title,
  subtitle,
  scrolled,
  unreadCount = 0,
  avatarInitial = "V",
  homeMode = false,
  onSearch,
  onBell,
  onShare,
  onBookmark,
  bookmarked = false,
}: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const tab = isTabRoute(pathname);
  const compact = scrolled;
  const isHome = homeMode || stripLocale(pathname) === "/";

  if (tab) {
    return (
      <header className={`app-header app-header--tab lg:hidden ${compact ? "is-compact" : ""} ${isHome ? "app-header--home" : ""}`}>
        <motion.div
          className="app-header__glass"
          initial={false}
          animate={{
            opacity: compact || !isHome ? (compact ? 1 : 0) : 0,
            backdropFilter: compact ? "blur(24px) saturate(180%)" : "blur(0px)",
          }}
          transition={{ duration: 0.22 }}
          aria-hidden
        />
        <div className={`app-header__bar ${compact ? "app-header__bar--compact" : ""} ${isHome ? "app-header__bar--home" : ""}`}>
          {!compact ? (
            isHome ? (
              <div className="app-header__greeting">
                {subtitle ? <p className="app-header__date">{subtitle}</p> : null}
                <h1 className="app-header__hello">{title}</h1>
              </div>
            ) : (
              <div className="app-header__large-wrap">
                <motion.div layoutId="vcm-brand-logo" className="app-header__logo">
                  <BrandLogo size={28} priority />
                </motion.div>
                <h1 className="app-header__large-title">{title || "VCM"}</h1>
              </div>
            )
          ) : (
            <motion.span
              className="app-header__inline-title"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
            >
              {isHome ? title.split(",")[0] || title : title || "VCM"}
            </motion.span>
          )}
          <div className="app-header__actions">
            <button type="button" className="app-header__btn app-header__glass-btn press" aria-label="Хайх" onClick={onSearch}>
              <Search size={18} strokeWidth={1.75} />
            </button>
            <button type="button" className="app-header__btn app-header__glass-btn press" aria-label="Мэдэгдэл" onClick={onBell}>
              <Bell size={18} strokeWidth={1.75} />
              {unreadCount > 0 && (
                <span className="ios-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </button>
            <Link href="/profile" prefetch className="app-header__btn app-header__glass-btn press" aria-label="Профайл">
              <span className="ios-avatar-btn">{avatarInitial}</span>
            </Link>
          </div>
        </div>
        <motion.div
          className="app-header__sep"
          initial={false}
          animate={{ opacity: compact ? 1 : 0 }}
          transition={{ duration: 0.18 }}
        />
      </header>
    );
  }

  return (
    <header className={`app-header app-header--detail lg:hidden ${compact ? "is-solid" : ""}`}>
      <motion.div
        className="app-header__glass"
        initial={false}
        animate={{ opacity: compact ? 1 : 0 }}
        transition={{ duration: 0.22 }}
        aria-hidden
      />
      <div className="app-header__bar app-header__bar--detail">
        <button
          type="button"
          className="app-header__round press"
          aria-label="Буцах"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <AnimatePresence>
          {compact && (
            <motion.span
              className="app-header__inline-title"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {title}
            </motion.span>
          )}
        </AnimatePresence>
        <div className="app-header__actions">
          <button type="button" className="app-header__round press" aria-label="Хуваалцах" onClick={onShare}>
            <Share2 size={18} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className={`app-header__round press ${bookmarked ? "is-on" : ""}`}
            aria-label="Хадгалах"
            onClick={onBookmark}
          >
            <Bookmark size={18} strokeWidth={1.75} fill={bookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
      <motion.div
        className="app-header__sep"
        initial={false}
        animate={{ opacity: compact ? 1 : 0 }}
      />
    </header>
  );
}
