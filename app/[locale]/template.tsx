"use client";

import PageTransition from "../components/PageTransition";

/** Route-aware iOS-style push / modal / tab transitions. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
