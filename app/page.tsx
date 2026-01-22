"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import HeroSlider from "./components/HeroSlider";

const Hero = dynamic(() => import("./components/Hero"), { ssr: false });
const EventsSection = dynamic(() => import("./components/Events"), { ssr: false });
const Expectations = dynamic(() => import("./components/Expectations"), { ssr: false });
const UsSection = dynamic(() => import("./components/UseSection"), { ssr: false });
const WhyChooseUs = dynamic(() => import("./components/WhyChooseUs"), { ssr: false });

// Simple loading skeleton
const SectionSkeleton = ({ height = "64" }: { height?: string }) => (
  <div className={`w-full h-${height} bg-slate-100 animate-pulse rounded-3xl mb-12`} />
);

export default function Home() {
  return (
    <>
      <HeroSlider />
      <Suspense fallback={<div className="w-full h-[95vh] bg-slate-50 animate-pulse" />}>
        <Hero />
      </Suspense>
      <Suspense fallback={<div className="w-full h-[800px] bg-slate-50 animate-pulse" />}>
        <UsSection />
      </Suspense>
      <Suspense fallback={<div className="w-full h-[700px] bg-slate-50 animate-pulse" />}>
        <EventsSection />
      </Suspense>
      <Suspense fallback={<div className="w-full h-[600px] bg-slate-50 animate-pulse" />}>
        <Expectations />
      </Suspense>
      <Suspense fallback={<div className="w-full h-[1200px] bg-slate-50 animate-pulse" />}>
        <WhyChooseUs />
      </Suspense>
    </>
  );
}
