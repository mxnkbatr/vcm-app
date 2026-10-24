"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/navigation";
import { BRAND } from "@/lib/branding";

type Banner = {
  _id?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
};

export default function HomeHeroCarousel({
  banners,
  fallback,
}: {
  banners?: Banner[];
  fallback: { title: string; subtitle?: string; image?: string; href: string };
}) {
  const slides: Banner[] =
    banners && banners.length > 0
      ? banners
      : [
          {
            id: "fallback",
            title: fallback.title,
            subtitle: fallback.subtitle,
            image: fallback.image,
            link: fallback.href,
          },
        ];

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth || 1;
    setIndex(Math.round(el.scrollLeft / w));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const el = scrollerRef.current;
    if (!el) return;
    const timer = setInterval(() => {
      const next = (index + 1) % slides.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
      setIndex(next);
    }, 6000);
    return () => clearInterval(timer);
  }, [index, slides.length]);

  return (
    <section className="home-hero">
      <div className="home-hero__glow" aria-hidden />
      <div
        ref={scrollerRef}
        className="home-hero__track"
        onScroll={onScroll}
      >
        {slides.map((b, i) => {
          const key = b._id || b.id || `slide-${i}`;
          const href = b.link || fallback.href;
          const title = b.title || fallback.title;
          const subtitle = b.subtitle || fallback.subtitle || BRAND.taglineMn;
          const inner = (
            <>
              {b.image ? (
                <Image
                  src={b.image}
                  alt={title}
                  fill
                  priority={i === 0}
                  className="home-hero__img"
                  sizes="(max-width: 520px) 100vw, 480px"
                />
              ) : (
                <div className="home-hero__fallback-bg" />
              )}
              <div className="home-hero__overlay" />
              <div className="home-hero__copy">
                <p className="home-hero__eyebrow">Онцлох</p>
                <h2 className="home-hero__title">{title}</h2>
                {subtitle ? <p className="home-hero__sub">{subtitle}</p> : null}
              </div>
            </>
          );
          return (
            <div key={key} className="home-hero__slide">
              {href ? (
                <Link href={href} className="home-hero__link press">
                  {inner}
                </Link>
              ) : (
                <div className="home-hero__link">{inner}</div>
              )}
            </div>
          );
        })}
      </div>
      {slides.length > 1 ? (
        <div className="home-hero__dots" role="tablist" aria-label="Баннер">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`home-hero__dot ${i === index ? "on" : ""}`}
              aria-label={`Slide ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => {
                const el = scrollerRef.current;
                if (!el) return;
                el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
                setIndex(i);
              }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
