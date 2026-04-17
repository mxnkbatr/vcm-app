import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.vcm.app",
  appName: "VCM",

  /*
    This project is a Next.js app (SSR + API routes).
    For Capacitor, the most reliable approach is to load the deployed web app via `server.url`.

    - During development: point to your LAN URL (e.g. http://192.168.1.10:3000)
    - For release builds: set to your HTTPS production domain
  */
  server: {
    url: "http://localhost:3000",
    cleartext: true,
  },
};

export default config;

