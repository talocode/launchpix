import type { Metadata } from "next";
import { TopNav } from "@/components/marketing/top-nav";
import { LandingSections } from "@/components/marketing/landing-sections";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Talocode LaunchPix | API-first launch visual generation",
  description: "Open-source API for launch-ready screenshot packs, promo tiles, and hero banners.",
  openGraph: {
    title: "Talocode LaunchPix",
    description: "Build launch visual workflows on a developer-first API.",
    url: "https://launchpix.talocode.com"
  },
  twitter: {
    card: "summary_large_image",
    title: "Talocode LaunchPix",
    description: "API-first launch visual generation for product teams."
  }
};

export default function HomePage() {
  return (
    <>
      <TopNav />
      <LandingSections />
      <MarketingFooter />
    </>
  );
}
