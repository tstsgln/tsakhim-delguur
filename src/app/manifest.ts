import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

// Web App Manifest — makes the site installable as a PWA (Android "Add to Home
// screen", and the base for the Play Store TWA package via PWABuilder).
// Kept to the standard spec so the same manifest also serves a future iOS package.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Цэцэглэн - Монгол гар урлалын зах зээл",
    short_name: SITE_NAME,
    description:
      "Монгол гар урлал, уламжлалт бүтээгдэхүүнийг онлайнаар худалдаалах зах зээл.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "mn",
    dir: "ltr",
    background_color: "#faf8f5",
    theme_color: "#c2185b",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
