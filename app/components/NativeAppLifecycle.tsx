"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/navigation";

/** Capacitor back button + resume refresh for native WebView shell. */
export default function NativeAppLifecycle() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let removeBack: (() => void) | undefined;
    let removeResume: (() => void) | undefined;

    void import("@capacitor/core").then(({ Capacitor }) => {
      if (!Capacitor.isNativePlatform()) return;

      void import("@capacitor/app").then(({ App }) => {
        void App.addListener("backButton", () => {
          const tabRoots = ["/", "/programs", "/shop", "/events", "/lessons"];
          const isTabRoot = tabRoots.some((p) => pathname === p || pathname.endsWith(p));
          if (window.history.length > 1 && !isTabRoot) {
            window.history.back();
            return;
          }
          if (!isTabRoot) router.push("/");
        }).then((h) => {
          removeBack = () => void h.remove();
        });

        void App.addListener("resume", () => {
          router.refresh();
        }).then((h) => {
          removeResume = () => void h.remove();
        });
      });
    });

    return () => {
      removeBack?.();
      removeResume?.();
    };
  }, [pathname, router]);

  return null;
}
