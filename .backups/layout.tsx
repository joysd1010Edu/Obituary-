import type { Metadata } from "next";
import { Crimson_Text, Geist_Mono, Montserrat } from "next/font/google";
import AppProviders from "./providers";
import "./globals.css";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://orbelofy.com"),
  title: {
    default: "Orbelofy | Memorials & Obituaries",
    template: "%s | Orbelofy",
  },
  description:
    "Create, discover, and share meaningful online memorials and obituary pages with photos, funeral details, tributes, and donation options.",
  applicationName: "Orbelofy",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Orbelofy | Memorials & Obituaries",
    description:
      "Create, discover, and share meaningful online memorials and obituary pages.",
    url: "/",
    siteName: "Orbelofy",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Orbelofy",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Orbelofy | Memorials & Obituaries",
    description:
      "Create, discover, and share meaningful online memorials and obituary pages.",
    images: ["/logo.png"],
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
