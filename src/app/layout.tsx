import type { Metadata, Viewport } from "next";
import { Geist_Mono, Instrument_Sans, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["600", "700", "800"],
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SubSync — Seven apps. One living ecosystem.",
  description:
    "SubSync connects TravelSync, PhotoSync, BrainSync, and four more intelligent platforms into one seamless productivity universe.",
  openGraph: {
    title: "SubSync",
    description: "Seven apps. One sync. Infinite possibility.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#030308",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${instrument.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh overflow-x-hidden">{children}</body>
    </html>
  );
}
