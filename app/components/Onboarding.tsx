"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  HeartHandshake,
  ShoppingBag,
  Users,
} from "lucide-react";
import { markOnboardingDone } from "@/lib/onboarding";
import { hapticImpact } from "@/lib/haptics";
import { ImpactStyle } from "@capacitor/haptics";
import { springNative } from "@/lib/motion";
import { BRAND } from "@/lib/branding";
import BrandLogo from "./BrandLogo";

type Slide = {
  Icon: typeof HeartHandshake;
  title: string;
  body: string;
  color: string;
  tint: string;
  Extra?: typeof BookOpen;
};

const SLIDES: Slide[] = [
  {
    Icon: HeartHandshake,
    title: "Сайн дурын үйлс",
    body: "VCM-тэй хамт нийгэмдээ эерэг өөрчлөлт бүтээ — жижиг үйлдэл, том үр дүн.",
    color: "#1E5BD8",
    tint: "#E8EEFB",
  },
  {
    Icon: Users,
    title: "Хөтөлбөр",
    body: "EDU, АНД, V-Club болон бусад хөтөлбөрт нэгдэж, өөрийн замыг сонго.",
    color: "#1E5BD8",
    tint: "#E8EEFB",
  },
  {
    Icon: CalendarDays,
    title: "Эвент & сургалт",
    body: "Арга хэмжээнд бүртгүүлж, хичээлүүдээр ур чадвараа өсгө.",
    color: "#34C759",
    tint: "#E8F8EC",
    Extra: BookOpen,
  },
  {
    Icon: ShoppingBag,
    title: "Эхлэхэд бэлэн",
    body: "Дэлгүүр, мэдээ, өргөдөл — бүгд нэг апп дотор. Аяллаа эхлүүлцгээе.",
    color: "#FF9F0A",
    tint: "#FFF4E5",
  },
];

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index]!;
  const last = index === SLIDES.length - 1;

  const finish = async () => {
    void hapticImpact(ImpactStyle.Medium);
    await markOnboardingDone();
    onDone();
  };

  const next = () => {
    void hapticImpact(ImpactStyle.Light);
    if (last) void finish();
    else setIndex((i) => i + 1);
  };

  const back = () => {
    if (index === 0) return;
    void hapticImpact(ImpactStyle.Light);
    setIndex((i) => i - 1);
  };

  return (
    <div className="onboarding" role="dialog" aria-label="Танилцуулга">
      <header className="onboarding__top">
        <div className="onboarding__brand">
          <BrandLogo size={28} />
          <span>{BRAND.shortName}</span>
        </div>
        {!last ? (
          <button type="button" className="onboarding__skip-btn press" onClick={() => void finish()}>
            Алгасах
          </button>
        ) : (
          <span className="onboarding__skip-spacer" />
        )}
      </header>

      <div className="onboarding__progress" aria-hidden>
        <div
          className="onboarding__progress-fill"
          style={{ width: `${((index + 1) / SLIDES.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          className="onboarding__slide"
          initial={{ x: 48 }}
          animate={{ x: 0 }}
          exit={{ x: -48 }}
          transition={springNative}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, info) => {
            if (info.offset.x < -72) next();
            else if (info.offset.x > 72) back();
          }}
        >
          <div
            className="onboarding__art"
            style={{
              background: `linear-gradient(160deg, ${slide.tint} 0%, color-mix(in srgb, ${slide.color} 12%, #F2F2F7) 100%)`,
            }}
          >
            <div
              className="onboarding__art-ring"
              style={{ borderColor: `color-mix(in srgb, ${slide.color} 28%, transparent)` }}
            >
              <slide.Icon size={64} strokeWidth={1.4} style={{ color: slide.color }} />
            </div>
            {slide.Extra ? (
              <span
                className="onboarding__art-badge"
                style={{ background: slide.color }}
              >
                <slide.Extra size={18} strokeWidth={2} color="#fff" />
              </span>
            ) : null}
          </div>

          <p className="onboarding__step">
            {index + 1} / {SLIDES.length}
          </p>
          <h2 className="onboarding__title">{slide.title}</h2>
          <p className="onboarding__body">{slide.body}</p>
        </motion.div>
      </AnimatePresence>

      <div className="onboarding__footer">
        <div className="onboarding__dots" aria-hidden>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`onboarding__dot ${i === index ? "on" : ""}`}
              aria-label={`Слайд ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="btn btn-primary btn-full onboarding__cta press"
          onClick={next}
        >
          {last ? "Эхлэх" : "Үргэлжлүүлэх"}
        </button>
      </div>
    </div>
  );
}
