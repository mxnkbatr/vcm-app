"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

/** Enables solid native perf mode: lighter blur, CSS motion, instant tabs. */
export default function NativePerfBoot() {
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const mobile = window.matchMedia("(max-width: 1023px)").matches;
      const native = Capacitor.isNativePlatform();
      root.classList.toggle("native-perf", mobile || native);
      root.classList.toggle("native-shell", native);
    };
    apply();
    const mq = window.matchMedia("(max-width: 1023px)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return null;
}
