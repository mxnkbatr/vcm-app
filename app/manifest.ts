import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.shortName,
    description: BRAND.descriptorMn,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: BRAND.colors.creamLight,
    theme_color: BRAND.colors.primary,
    icons: [
      {
        src: BRAND.icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: BRAND.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: BRAND.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

