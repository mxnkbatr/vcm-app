"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HeartHandshake, Sparkles, Users } from "lucide-react";
import { markOnboardingDone } from "@/lib/onboarding";
import { hapticImpact } from "@/lib/haptics";
import { ImpactStyle } from "@capacitor/haptics";
import { springNative } from "@/lib/motion";

const SLIDES = [
  {
    Icon: HeartHandshake,
    title: "Сайн дурын үйлс",
    body: "Монголын сайн дурынхны төвтэй хамт нийгэмдээ эерэг өөрчлөлт бүтээ.",
    color: "#1E5BD8",
  },
  {
    Icon: Users,
    title: "Хөтөлбөр & эвент",
    body: "Хөтөлбөр, арга хэмжээнд нэгдэж, шинэ хүмүүстэй холбогд.",
    color: "#34C759",
  },
  {
    Icon: Sparkles,
    title: "Таны аялал эхэлнэ",
    body: "Профайл үүсгээд эхний алхмаа хий — жижиг үйлдэл, том өөрчлөлт.",
    color: "#FF9F0A",
  },
] as const;

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

  return (
    <div className="onboarding" role="dialog" aria-label="Танилцуулга">
      <div className="onboarding__skip">
        {!last && (
          <button type="button" className="press" onClick={() => void finish()}>
            Алгасах
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="onboarding__slide"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={springNative}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) next();
            else if (info.offset.x > 80 && index > 0) setIndex((i) => i - 1);
          }}
        >
          <div
            className="onboarding__art"
            style={{ background: `color-mix(in srgb, ${slide.color} 18%, #F2F2F7)` }}
          >
            <slide.Icon size={72} strokeWidth={1.5} style={{ color: slide.color }} />
          </div>
          <h2 className="onboarding__title">{slide.title}</h2>
          <p className="onboarding__body">{slide.body}</p>
        </motion.div>
      </AnimatePresence>

      <div className="onboarding__footer">
        <div className="onboarding__dots" aria-hidden>
          {SLIDES.map((_, i) => (
            <span key={i} className={`onboarding__dot ${i === index ? "on" : ""}`} />
          ))}
        </div>
        <button type="button" className="btn btn-primary btn-full" onClick={next}>
          {last ? "Эхлэх" : "Үргэлжлүүлэх"}
        </button>
      </div>
    </div>
  );
}
