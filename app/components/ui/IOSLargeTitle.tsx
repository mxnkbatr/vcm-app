"use client";

import { useEffect } from "react";

/**
 * Publishes page title to AppHeader. Visual large title lives in AppHeader on tab roots;
 * detail pages still use this for the scrolled inline title.
 */
export default function IOSLargeTitle({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("vcm:page-title", { detail: { title } }));
    return () => {
      window.dispatchEvent(new CustomEvent("vcm:page-title", { detail: { title: "" } }));
    };
  }, [title]);

  if (!children) {
    return <h1 className="ios-large-title sr-only">{title}</h1>;
  }

  return (
    <div className="app-large-title-slot pt-1 pb-2">
      <h1 className="ios-large-title sr-only">{title}</h1>
      {children}
    </div>
  );
}
