"use client";

import { useEffect } from "react";
import { usePathname } from "@/navigation";

function mainEl() {
  return document.querySelector<HTMLElement>(".native-app-main");
}

/** Every route change starts at the top of that page. */
export default function ScrollMemory() {
  const pathname = usePathname();

  useEffect(() => {
    const toTop = () => {
      const el = mainEl();
      if (el) el.scrollTop = 0;
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    toTop();
    const t1 = window.setTimeout(toTop, 16);
    const t2 = window.setTimeout(toTop, 80);
    const t3 = window.setTimeout(toTop, 180);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [pathname]);

  return null;
}
