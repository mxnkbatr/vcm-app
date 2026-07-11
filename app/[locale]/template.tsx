"use client";

import { usePathname } from "next/navigation";

/** Native tab apps: instant screen cuts — no web-style page transitions. */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="min-h-dvh w-full">
      {children}
    </div>
  );
}
