import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { BookingModalProvider } from "./components/booking/BookingModalProvider";
import { SmoothScroll } from "./components/SmoothScroll";
import { Cursor } from "./components/Cursor";
import { Intro } from "./components/Intro";
import { cn } from "@/lib/utils";

// Self-hosted variable fonts (no build-time network fetch).
const inter = localFont({
  src: "./fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const bricolage = localFont({
  src: "./fonts/BricolageGrotesque-Variable.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-Variable.woff2",
  variable: "--font-jetbrains-mono",
  weight: "100 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Footnote, Web Design & Dev Studio",
  description:
    "Footnote is a design and development studio. We craft fast, distinctive websites, from the first wireframe to the final deploy.",
  metadataBase: new URL("https://footnote.agency"),
  openGraph: {
    title: "Footnote, Web Design & Dev Studio",
    description:
      "Custom websites with a point of view. Design, development, and SEO for brands that refuse to look templated.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        inter.variable,
        bricolage.variable,
        jetbrainsMono.variable,
      )}
    >
      <body className="min-h-full bg-bone font-sans text-ink antialiased">
        <Intro />
        <Cursor />
        <SmoothScroll>
          <BookingModalProvider>{children}</BookingModalProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
