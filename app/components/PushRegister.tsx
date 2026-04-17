"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

export default function PushRegister() {
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    async function run() {
      try {
        if (!Capacitor.isNativePlatform()) return;

        const { PushNotifications } = await import("@capacitor/push-notifications");

        const perm = await PushNotifications.checkPermissions();
        if (perm.receive !== "granted") {
          const req = await PushNotifications.requestPermissions();
          if (req.receive !== "granted") return;
        }

        await PushNotifications.register();

        const sub1 = await PushNotifications.addListener("registration", async (token) => {
          try {
            const platform = Capacitor.getPlatform() as "ios" | "android" | "web";
            await fetch("/api/user/device-tokens", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ token: token.value, platform }),
            });
          } catch {
            // Keep silent: retry occurs on next app launch.
          }
        });

        const sub2 = await PushNotifications.addListener("registrationError", () => {
          // noop
        });

        cleanup = () => {
          sub1.remove();
          sub2.remove();
        };
      } catch {
        // noop
      }
    }

    run();
    return () => cleanup?.();
  }, []);

  return null;
}

