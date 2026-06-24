import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const SITE_URL = "https://elevateedgedigitalagency.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ElevateEdge Digital Agency – Strategic Growth & Premium Web Solutions",
  description:
    "Amplify your business with elite digital strategies. Custom high-conversion websites, targeted marketing, and social media management designed to scale your ROI.",
  keywords: [
    "ElevateEdge",
    "Digital Agency",
    "Web Design",
    "Digital Marketing",
    "Social Media",
    "Web Development",
  ],
  authors: [{ name: "ElevateEdge Digital" }],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "ElevateEdge Digital Agency – Strategic Growth & Premium Web Solutions",
    description:
      "Get 2× the growth for your business with our budget-friendly digital solutions. Custom websites and premium marketing.",
    siteName: "ElevateEdge Digital Agency",
    type: "website",
    images: [
      {
        url: "/agency-preview-thumbnail.jpg",
        width: 848,
        height: 478,
        alt: "ElevateEdge Digital Agency - Premium Web Solutions",
      },
    ],
    videos: [
      {
        url: "/agency-preview.mp4",
        width: 848,
        height: 478,
        type: "video/mp4",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ElevateEdge Digital Agency",
    description:
      "Amplify your business with elite digital strategies. Get 2× growth with our premium web solutions.",
    images: ["/agency-preview-thumbnail.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        {/* Open Graph Video Meta Tags for social media link previews */}
        {/* These ensure video auto-plays when link is shared on WhatsApp, Facebook, Instagram, Messenger */}
        <meta property="og:type" content="video.other" />
        <meta property="og:video" content={`${SITE_URL}/agency-preview.mp4`} />
        <meta property="og:video:url" content={`${SITE_URL}/agency-preview.mp4`} />
        <meta property="og:video:secure_url" content={`${SITE_URL}/agency-preview.mp4`} />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="848" />
        <meta property="og:video:height" content="478" />
        <meta property="og:image" content={`${SITE_URL}/agency-preview-thumbnail.jpg`} />
        <meta property="og:image:width" content="848" />
        <meta property="og:image:height" content="478" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta name="twitter:card" content="player" />
        <meta name="twitter:player" content={`${SITE_URL}/agency-preview.mp4`} />
        <meta name="twitter:player:width" content="848" />
        <meta name="twitter:player:height" content="478" />
        <meta name="twitter:image" content={`${SITE_URL}/agency-preview-thumbnail.jpg`} />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
