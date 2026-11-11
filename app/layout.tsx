import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { PageviewBeacon } from "@/components/pageview-beacon";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SponsorBar } from "@/components/sponsor-bar";
import { getCurrentSponsor } from "@/lib/sponsors";
import { goPath, siteUrl } from "@/lib/site";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-source",
  display: "swap",
});

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-tight",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Will It HA — Australian solar and battery Home Assistant compatibility",
    template: "%s — Will It HA",
  },
  description:
    "Home Assistant Compatibility - For Australians. Batteries and inverters rated for local control, cloud lock-in, and the Energy Dashboard.",
  applicationName: "Will It HA",
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "Will It HA",
    url: siteUrl(),
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const sponsor = await getCurrentSponsor();
  const href = sponsor.kind === "sponsor" ? goPath(sponsor.slug, "/") : "/sponsor";
  const kicker = sponsor.kind === "sponsor" ? `Sponsored by ${sponsor.name}` : "Sponsor Will It HA";
  const message =
    sponsor.kind === "sponsor"
      ? sponsor.blurb || "This week’s sponsor."
      : "Weekly newsletter and the site slot, from A$49/week.";

  return (
    <html lang="en-AU" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen bg-white font-sans text-ink antialiased">
        <PageviewBeacon />
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-card focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <SponsorBar id={sponsor.id} href={href} kicker={kicker} message={message} />
        <SiteHeader />
        <main id="content" className="mx-auto w-full min-w-0 max-w-[1080px] px-5 sm:px-10">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
