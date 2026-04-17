import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Volunteer Center Mongolia",
    short_name: "VCM",
    description: "Small Actions, Big Differences",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F2F2F7",
    theme_color: "#F2F2F7",
    icons: [
      {
        src: "/globe.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

