'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/navigation';

import { Banner } from '@/models/Banner';
import { clientCache } from '@/lib/client-cache';
import { hapticImpact } from '@/lib/haptics';
import { ImpactStyle } from '@capacitor/haptics';

const DEFAULT_INTERVAL_SEC = 8;
const TRANSITION_SEC = 1.0;

const FALLBACK_BANNERS: Banner[] = [
  {
    id: 'fallback-shoebox',
    title: 'Shoebox Project Mongolia',
    subtitle: 'Хуучин гутлын хайрцагтаа ид шид бүтээ',
    image: '/banners/shoebox-project.png',
    link: '/events',
    active: true,
    intervalSec: DEFAULT_INTERVAL_SEC,
  },
  {
    id: 'fallback-about',
    title: 'Сайн дурын үйлс',
    subtitle: 'Жижиг үйлдэл — том өөрчлөлт',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80',
    link: '/about',
    active: true,
    intervalSec: DEFAULT_INTERVAL_SEC,
  },
];

type BannerSliderProps = {
  locale?: string;
  initialBanners?: Banner[];
};

export default function BannerSlider({ locale = 'mn', initialBanners }: BannerSliderProps) {
  const cacheKey = `/api/banners?locale=${locale}`;
  const [banners, setBanners] = useState<Banner[]>(initialBanners?.length ? initialBanners : []);
  const [isLoading, setIsLoading] = useState(!(initialBanners && initialBanners.length > 0));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const current = banners[currentIndex];
  const intervalMs = Math.max(5000, (current?.intervalSec || DEFAULT_INTERVAL_SEC) * 1000);

  const nextSlide = useCallback(() => {
    if (banners.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    if (banners.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goTo = useCallback((i: number) => {
    setDirection(i > currentIndex ? 1 : -1);
    setCurrentIndex(i);
    hapticImpact(ImpactStyle.Light);
  }, [currentIndex]);

  useEffect(() => {
    if (currentIndex >= banners.length && banners.length > 0) {
      setCurrentIndex(0);
    }
  }, [banners.length, currentIndex]);

  useEffect(() => {
    if (initialBanners?.length) {
      clientCache.set(cacheKey, { banners: initialBanners });
    }

    const stale = clientCache.age(cacheKey) > 120_000;
    if (initialBanners?.length && !stale) {
      setIsLoading(false);
      return;
    }

    const fetchBanners = async () => {
      try {
        const response = await fetch(cacheKey);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (data.banners?.length > 0) {
          clientCache.set(cacheKey, data);
          setBanners(data.banners);
        } else if (!initialBanners?.length) {
          setBanners(FALLBACK_BANNERS);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
        if (!initialBanners?.length) setBanners(FALLBACK_BANNERS);
      } finally {
        setIsLoading(false);
      }
    };

    if (stale || !initialBanners?.length) {
      fetchBanners();
    }
  }, [locale, cacheKey, initialBanners]);

  useEffect(() => {
    if (isHovered || isPaused || banners.length <= 1) return;
    const timer = setInterval(nextSlide, intervalMs);
    return () => clearInterval(timer);
  }, [nextSlide, isHovered, isPaused, banners.length, intervalMs]);

  const variants: Variants = {
    enter: {
      opacity: 0,
    },
    center: {
      zIndex: 1,
      opacity: 1,
    },
    exit: {
      zIndex: 0,
      opacity: 0,
    },
  };

  if (isLoading || banners.length === 0) {
    return (
      <div className="w-full px-5 pt-3">
        <div
          className="w-full animate-pulse banner-slider-shell"
          style={{ background: 'var(--fill2)' }}
        />
      </div>
    );
  }

  const slideContent = (
    <>
      <div className="absolute inset-0">
        <Image
          src={current?.image || ''}
          alt={current?.title || `Banner ${currentIndex + 1}`}
          fill
          priority={currentIndex === 0}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
      </div>

      <div className="banner-slider-overlay" />

      {(current?.title || current?.subtitle) && (
        <div className="banner-slider-caption">
          {current?.title && (
            <h2 className="banner-slider-title">{current.title}</h2>
          )}
          {current?.subtitle && (
            <p className="banner-slider-subtitle">{current.subtitle}</p>
          )}
        </div>
      )}
    </>
  );

  return (
    <section className="w-full px-5 pt-3">
      <div
        className="banner-slider-shell group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setTimeout(() => setIsPaused(false), 5000)}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: TRANSITION_SEC, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            {current?.link ? (
              <Link href={current.link} className="block relative w-full h-full press">
                {slideContent}
              </Link>
            ) : (
              <div className="relative w-full h-full">{slideContent}</div>
            )}
          </motion.div>
        </AnimatePresence>

        {banners.length > 1 && (
          <>
            <div className="absolute inset-0 z-10 hidden sm:flex items-center justify-between px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { prevSlide(); hapticImpact(ImpactStyle.Light); }}
                className="press p-2 rounded-full banner-slider-nav pointer-events-auto"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { nextSlide(); hapticImpact(ImpactStyle.Light); }}
                className="press p-2 rounded-full banner-slider-nav pointer-events-auto"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  className="press p-1"
                  aria-label={`Slide ${i + 1}`}
                >
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? 'w-6 h-1.5 bg-white shadow-sm'
                        : 'w-1.5 h-1.5 bg-white/45'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 h-0.5 bg-white/15 w-full z-20">
              <motion.div
                key={`${currentIndex}-${intervalMs}`}
                initial={{ width: 0 }}
                animate={{ width: isHovered || isPaused ? '0%' : '100%' }}
                transition={{ duration: isHovered || isPaused ? 0 : intervalMs / 1000, ease: 'linear' }}
                className="h-full bg-white/70"
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
