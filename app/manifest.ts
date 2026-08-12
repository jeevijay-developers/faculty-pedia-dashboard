import type { MetadataRoute } from "next";

/**
 * Installable PWA shell. No service worker — the dashboard always talks to the
 * network, so there is no cached data to go stale.
 *
 * NOTE: both icon entries currently point at the existing 154KB finalLogo.png.
 * Purpose-built 192x192 and 512x512 maskable icons should replace these before
 * this ships to educators, or Android will letterbox the home-screen icon.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Facultypedia Educator Dashboard",
    short_name: "Facultypedia",
    description:
      "Manage your courses, tests, content and students on Facultypedia.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/finalLogo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/finalLogo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
