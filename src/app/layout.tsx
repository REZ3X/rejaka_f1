import type { Metadata, Viewport } from "next";
import { Jost, JetBrains_Mono } from "next/font/google";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "./globals.css";

const jost = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3F4F6" },
    { media: "(prefers-color-scheme: dark)", color: "#011425" },
  ],
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  title: {
    default: "R-F1 | REZ3X-F1 Platform",
    template: "%s | R-F1",
  },
  description:
    "Analyze real F1 race data, simulate tire strategies, and compare them side-by-side. The ultimate motorsport telemetry experience.",
  keywords: [
    "F1",
    "Formula 1",
    "strategy",
    "simulator",
    "tire strategy",
    "race analysis",
    "pit stop",
    "telemetry",
    "motorsport",
    "Red Bull Racing",
  ],
  metadataBase: new URL("https://rejaka.id"),
  authors: [{ name: "REZ3X", url: "https://rejaka.id" }],
  creator: "REZ3X",
  publisher: "REZ3X Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "R-F1 | REZ3X-F1 Platform",
    description:
      "Analyze real F1 race data, simulate tire strategies, and compare them side-by-side. The ultimate motorsport telemetry experience.",
    url: "/",
    siteName: "R-F1",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "R-F1 App Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "R-F1 | REZ3X-F1 Platform",
    description:
      "Analyze real F1 race data, simulate tire strategies, and compare them side-by-side.",
    creator: "@REZ3X",
    images: ["/android-chrome-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
      data-theme="dark"
      className={`${jost.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider>
          <Navbar />
          <main
            className="flex flex-1 flex-col"
            style={{ paddingTop: "var(--nav-height)" }}
          >
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
