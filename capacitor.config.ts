import type { CapacitorConfig } from "@capacitor/cli";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

const serverUrl =
  process.env.CAPACITOR_SERVER_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://vcm-app.vercel.app");

const config: CapacitorConfig = {
  appId: "com.vcm.app",
  appName: "Volunteer Center Mongolia",
  webDir: "public",
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith("http://"),
    androidScheme: serverUrl.startsWith("https") ? "https" : "http",
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1200,
      backgroundColor: "#FBF8F3",
      showSpinner: false,
      androidSplashResourceName: "splash",
    },
    StatusBar: {
      overlaysWebView: true,
      backgroundColor: "#FBF8F3",
      style: "LIGHT",
    },
  },
};

export default config;
