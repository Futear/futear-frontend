import Navbar from "@/components/layout/Navbar";
import ThemeLoader from "@/components/theme/ThemeLoader";
import { getScopeBySlug } from "@/lib/getScopes";

export const dynamicParams = false;

const SITE_URL = "https://futear.app";

export function generateMetadata({ params }) {
  const scope = getScopeBySlug(params.slug);

  if (!scope) {
    return {
      title: "Futear",
    };
  }

  const icons = scope.branding?.icons ?? {};

  const description =
    scope.identity?.slogan ||
    `Juegos y trivias sobre ${scope.identity?.fanBase || "fútbol"}`;

  return {
    title: scope.name,

    description,

    manifest: icons.manifest,

    icons: {
      icon: [
        {
          url: icons.favicon,
        },
        {
          url: icons.favicon16,
          sizes: "16x16",
          type: "image/png",
        },
        {
          url: icons.favicon32,
          sizes: "32x32",
          type: "image/png",
        },
      ],

      apple: [
        {
          url: icons.apple,
          sizes: "180x180",
        },
      ],

      shortcut: [icons.favicon],

      other: [
        {
          rel: "icon",
          url: icons.icon192,
          sizes: "192x192",
          type: "image/png",
        },
        {
          rel: "icon",
          url: icons.icon512,
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },

    openGraph: {
      title: scope.name,

      description,

      url: `${SITE_URL}/${scope.slug}`,

      siteName: "Futear",

      locale: "es_AR",

      type: "website",

      images: [
        {
          url: `${SITE_URL}${scope.branding?.logo}`,
          width: 1200,
          height: 1200,
          alt: scope.name,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title: scope.name,

      description,

      images: [`${SITE_URL}${scope.branding?.logo}`],
    },
  };
}

export default function ScopeLayout({ children, params }) {
  const scope = getScopeBySlug(params.slug);

  if (!scope) {
    return children;
  }

  return (
    <>
      <ThemeLoader slug={scope.slug} />
      <div
        data-scope={scope.slug}
        className="bg-[var(--background)] min-h-screen text-[var(--text)]"
      >
        <Navbar
          priority
          title={scope.name}
          logo={scope.branding?.logo || scope.branding?.shield}
          homeUrl={`/${scope.slug}`}
        />

        {children}
      </div>
    </>
  );
}
