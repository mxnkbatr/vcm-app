import Image from "next/image";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import HeroSlider from "./components/HeroSlider";
import Hero from "./components/Hero";

const EventsSection = dynamic(() => import("./components/Events"));
const Expectations = dynamic(() => import("./components/Expectations"));
const UsSection = dynamic(() => import("./components/UseSection"));
const WhyChooseUs = dynamic(() => import("./components/WhyChooseUs"));

// Simple loading skeleton
const SectionSkeleton = () => (
  <div className="w-full h-64 bg-slate-100 animate-pulse rounded-3xl" />
);

export default function Home() {
  return (
    <>
      <HeroSlider />
      <Hero />
      <Suspense fallback={<SectionSkeleton />}>
        <UsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <EventsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <Expectations />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <WhyChooseUs />
      </Suspense>
    </>
  );
}
