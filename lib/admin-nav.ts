import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingBag,
  GraduationCap,
  Calendar,
  Newspaper,
  ClipboardList,
  Plane,
  Tag,
  ImageIcon,
} from "lucide-react";

export type AdminTabId =
  | "dashboard"
  | "users"
  | "programs"
  | "events"
  | "news"
  | "applications"
  | "lessons"
  | "lms"
  | "shop"
  | "promos"
  | "banners";

export type AdminTab = {
  id: AdminTabId;
  label: string;
  shortLabel: string;
  description: string;
  Icon: LucideIcon;
  /** Bottom bar shortcut on mobile */
  mobilePrimary?: boolean;
};

export const ADMIN_TABS: AdminTab[] = [
  {
    id: "dashboard",
    label: "Хяналтын самбар",
    shortLabel: "Нүүр",
    description: "Статистик, хурдан холбоос",
    Icon: LayoutDashboard,
    mobilePrimary: true,
  },
  {
    id: "applications",
    label: "Өргөдөл",
    shortLabel: "Өргөдөл",
    description: "Шинэ өргөдөл батлах, татгалзах",
    Icon: ClipboardList,
    mobilePrimary: true,
  },
  {
    id: "users",
    label: "Хэрэглэгчид",
    shortLabel: "Хэрэглэгч",
    description: "Эрх, мэдээлэл засах",
    Icon: Users,
    mobilePrimary: true,
  },
  {
    id: "programs",
    label: "Хөтөлбөр",
    shortLabel: "Хөтөлбөр",
    description: "Хөтөлбөр, асуулт удирдах",
    Icon: Plane,
  },
  {
    id: "events",
    label: "Арга хэмжээ",
    shortLabel: "Арга",
    description: "Эвент нэмэх, засах",
    Icon: Calendar,
  },
  {
    id: "news",
    label: "Мэдээ",
    shortLabel: "Мэдээ",
    description: "Мэдээний нийтлэл",
    Icon: Newspaper,
  },
  {
    id: "banners",
    label: "Баннер",
    shortLabel: "Баннер",
    description: "Нүүр хуудсын зураг",
    Icon: ImageIcon,
  },
  {
    id: "lessons",
    label: "Хичээл",
    shortLabel: "Хичээл",
    description: "Сургалтын контент",
    Icon: BookOpen,
  },
  {
    id: "lms",
    label: "LMS",
    shortLabel: "LMS",
    description: "Курс, модуль, хичээл",
    Icon: GraduationCap,
  },
  {
    id: "shop",
    label: "Дэлгүүр",
    shortLabel: "Дэлгүүр",
    description: "Бараа, захиалга",
    Icon: ShoppingBag,
  },
  {
    id: "promos",
    label: "Промо код",
    shortLabel: "Промо",
    description: "Хөнгөлөлтийн код",
    Icon: Tag,
  },
];

export function adminTabHref(id: AdminTabId): string {
  return id === "dashboard" ? "/admin" : `/admin?tab=${id}`;
}

export function adminTabById(id: string | null | undefined): AdminTab {
  return ADMIN_TABS.find((t) => t.id === id) ?? ADMIN_TABS[0];
}

export const ADMIN_MOBILE_PRIMARY = ADMIN_TABS.filter((t) => t.mobilePrimary);
