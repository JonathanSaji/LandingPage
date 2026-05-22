import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SubSync",
  description: "SubSync Landing Page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
