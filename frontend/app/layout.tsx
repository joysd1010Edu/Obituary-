import type { Metadata } from "next";
import { Crimson_Text, Geist_Mono, Montserrat } from "next/font/google";
import AppProviders from "./providers";
import "./globals.css";
import {
  absoluteUrl,
  alternateDomains,
  defaultDescription,
  defaultKeywords,
  defaultTitle,
  siteName,
  siteUrl,
} from "./seo";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const crimsonText = Crimson_Text({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | Orbelofy",
  },
  description: defaultDescription,
  keywords: defaultKeywords,
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "memorials",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": alternateDomains[0],
      "en-GB": "https://orbelofy.co.uk",
      "en-IE": "https://orbelofy.ie",
      "x-default": alternateDomains[0],
    },
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: "/",
    siteName,
    images: [
      {
        url: absoluteUrl("/logo.png"),
        width: 512,
        height: 512,
        alt: siteName,
      },
    ],
    locale: "en_GB",
    alternateLocale: ["en_US", "en_IE"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [absoluteUrl("/logo.png")],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${geistMono.variable} ${crimsonText.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#faf8f5] text-slate-950">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
