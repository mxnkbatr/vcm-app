"use client";

import { useEffect } from "react";

/** Publishes page title to MobileChrome for large-title collapse. */
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

  return (
    <div className="pt-1 pb-2">
      <h1 className="ios-large-title">{title}</h1>
      {children}
    </div>
  );
}
