import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";

import { GoogleAdsScript } from "@/components/GoogleAdsScript";
import GameProgressHydrator from "@/components/providers/GameProgressHydrator";
import DebugDatePanel from "@/components/dev/DebugDatePanel";
import { getScopeBySlug } from "@/lib/getScopes";

// import { getTheme } from "@/lib/getTheme";
// import { generateThemeCSS } from "@/lib/themes/generateThemeCSS";
// import AudioProvider from "@/components/audio/providers/AudioProvider";

const SITE_URL = "https://futear.app";

const globalScope = getScopeBySlug("global");

export const metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Futear",
    template: "%s | Futear",
  },

  description:
    "Juegos, trivias y desafíos sobre fútbol, camisetas, jugadores, clubes, ligas y Mundiales.",

  manifest: "/site.webmanifest",

  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],

    shortcut: "/favicon.ico",

    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
      },
    ],
  },

  openGraph: {
    title: "Futear",

    description:
      "Juegos, trivias y desafíos sobre fútbol, camisetas, jugadores, clubes, ligas y Mundiales.",

    url: SITE_URL,

    siteName: "Futear",

    locale: "es_AR",

    type: "website",

    images: [
      {
        url: `${SITE_URL}${globalScope.branding.logo}`,
        width: 1200,
        height: 1200,
        alt: "Futear",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Futear",

    description:
      "Juegos, trivias y desafíos sobre fútbol, camisetas, jugadores, clubes, ligas y Mundiales.",

    images: [`${SITE_URL}${globalScope.branding.logo}`],
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",

    "@type": "WebSite",

    name: "Futear",

    url: SITE_URL,
  };

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem("theme"),d=window.matchMedia("(prefers-color-scheme: dark)").matches;if(t==="dark"||(!t&&d)){document.documentElement.classList.add("dark")}}catch(e){}`,
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>

      <body className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text)]">
        <GameProgressHydrator />

        {children}

        <GoogleAdsScript />

        {process.env.NODE_ENV === "production" && <Analytics />}

        {process.env.NODE_ENV === "development" && <DebugDatePanel />}

        <GoogleAnalytics gaId="G-KZXFLMEH9V" />
      </body>
    </html>
  );
}
