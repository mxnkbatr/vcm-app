"use client";

import { Link, usePathname, useRouter } from "@/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Bell, Bookmark, Search, Share2,
} from "lucide-react";
import { isTabRoute } from "@/lib/navigation-motion";
import BrandLogo from "@/app/components/BrandLogo";

type AppHeaderProps = {
  title: string;
  scrolled: boolean;
  unreadCount?: number;
  avatarInitial?: string;
  onSearch?: () => void;
  onBell?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  bookmarked?: boolean;
};

/** Unified native header — tab (large→inline) + detail (transparent→solid). */
export default function AppHeader({
  title,
  scrolled,
  unreadCount = 0,
  avatarInitial = "V",
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

  const actions = (
    <div className="app-header__actions">
      <div className="app-header__cluster">
        <button type="button" className="app-header__btn press" aria-label="Хайх" onClick={onSearch}>
          <Search size={17} strokeWidth={1.85} />
        </button>
        <button type="button" className="app-header__btn press" aria-label="Мэдэгдэл" onClick={onBell}>
          <Bell size={17} strokeWidth={1.85} />
          {unreadCount > 0 && (
            <span className="ios-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </button>
      </div>
      <Link href="/profile" prefetch className="app-header__btn app-header__glass-btn press" aria-label="Профайл">
        <span className="ios-avatar-btn">{avatarInitial}</span>
      </Link>
    </div>
  );

  if (tab) {
    return (
      <header className={`app-header app-header--tab lg:hidden ${compact ? "is-compact" : ""}`}>
        <div className="app-header__glass" aria-hidden />
        {!compact ? (
          <div className="app-header__bar">
            <div className="app-header__large-wrap">
              <motion.div layoutId="vcm-brand-logo" className="app-header__logo">
                <BrandLogo size={28} priority />
              </motion.div>
              <h1 className="app-header__large-title">{title || "VCM"}</h1>
            </div>
            {actions}
          </div>
        ) : (
          <div className="app-header__bar app-header__bar--compact">
            <div className="app-header__compact-balance" aria-hidden />
            <span className="app-header__inline-title">{title || "VCM"}</span>
            {actions}
          </div>
        )}
        <div className={`app-header__sep ${compact ? "is-on" : ""}`} />
      </header>
    );
  }

  return (
    <header className={`app-header app-header--detail lg:hidden ${compact ? "is-solid" : ""}`}>
      <div className={`app-header__glass ${compact ? "is-on" : ""}`} aria-hidden />
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
          {compact && title ? (
            <motion.span
              className="app-header__inline-title"
              initial={{ y: 6 }}
              animate={{ y: 0 }}
              exit={{ y: 4 }}
              transition={{ duration: 0.16 }}
            >
              {title}
            </motion.span>
          ) : (
            <span className="app-header__inline-title app-header__inline-title--spacer" aria-hidden />
          )}
        </AnimatePresence>
        <div className="app-header__actions">
          <div className="app-header__cluster">
            <button type="button" className="app-header__btn press" aria-label="Хуваалцах" onClick={onShare}>
              <Share2 size={17} strokeWidth={1.85} />
            </button>
            <button
              type="button"
              className={`app-header__btn press ${bookmarked ? "is-on" : ""}`}
              aria-label="Хадгалах"
              onClick={onBookmark}
              style={bookmarked ? { color: "var(--blue)" } : undefined}
            >
              <Bookmark size={17} strokeWidth={1.85} fill={bookmarked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
      <div className={`app-header__sep ${compact ? "is-on" : ""}`} />
    </header>
  );
}
