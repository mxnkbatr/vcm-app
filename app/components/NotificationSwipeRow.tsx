"use client";

import { useRef, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { hapticImpact } from "@/lib/haptics";
import { ImpactStyle } from "@capacitor/haptics";

type Props = {
  children: React.ReactNode;
  onDelete: () => void;
  onRead: () => void;
};

const THRESHOLD = 88;

/** Swipe left → delete, swipe right → mark read. */
export default function NotificationSwipeRow({ children, onDelete, onRead }: Props) {
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);
  const [dx, setDx] = useState(0);

  return (
    <div className="notif-swipe">
      <div className="notif-swipe__actions notif-swipe__actions--left" aria-hidden>
        <Check size={20} />
        <span>Уншсан</span>
      </div>
      <div className="notif-swipe__actions notif-swipe__actions--right" aria-hidden>
        <Trash2 size={20} />
        <span>Устгах</span>
      </div>
      <div
        className="notif-swipe__content"
        style={{ transform: `translateX(${dx}px)` }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (!t) return;
          startX.current = t.clientX;
          startY.current = t.clientY;
          tracking.current = true;
        }}
        onTouchMove={(e) => {
          if (!tracking.current) return;
          const t = e.touches[0];
          if (!t) return;
          const x = t.clientX - startX.current;
          const y = Math.abs(t.clientY - startY.current);
          if (y > 24 && Math.abs(x) < 12) {
            tracking.current = false;
            setDx(0);
            return;
          }
          if (Math.abs(x) > y) {
            e.preventDefault();
            setDx(Math.max(-120, Math.min(120, x)));
          }
        }}
        onTouchEnd={() => {
          if (!tracking.current) return;
          tracking.current = false;
          if (dx <= -THRESHOLD) {
            void hapticImpact(ImpactStyle.Medium);
            onDelete();
          } else if (dx >= THRESHOLD) {
            void hapticImpact(ImpactStyle.Light);
            onRead();
          }
          setDx(0);
        }}
        onTouchCancel={() => {
          tracking.current = false;
          setDx(0);
        }}
      >
        {children}
      </div>
    </div>
  );
}
