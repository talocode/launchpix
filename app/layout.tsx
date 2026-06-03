import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";

export const metadata: Metadata = {
  title: "Talocode LaunchPix",
  description: "API-first, open-source launch asset generation for developer teams.",
  icons: {
    icon: "/icon.svg"
  },
  openGraph: {
    title: "Talocode LaunchPix",
    description: "API-first launch visual generation with deterministic fallbacks.",
    url: "https://launchpix.talocode.com",
    siteName: "Talocode LaunchPix",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Talocode LaunchPix",
    description: "Open-source launch visuals API for product and growth teams."
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
