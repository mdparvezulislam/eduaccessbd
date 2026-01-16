import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { ImageKitProvider } from "@imagekit/next";
import { Toaster } from "sonner";

// 1. FONTS
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// 2. CONFIGURATION (Replace with your actual domain)
const SITE_NAME = "Edu Access BD";
const SITE_DESCRIPTION = "Edu Access BD is the leading platform for premium online courses in Bangladesh. Master coding, design, marketing, and professional skills at affordable prices.";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://eduaccessbd.store"; // ⚠️ Change this to your real domain

// 3. SEO METADATA
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Edu Access BD - Best Premium Courses in Bangladesh",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Edu Access BD",
    "Online Course Bangladesh",
    "Premium Course BD",
    "Skill Development",
    "Web Development Course BD",
    "Digital Marketing Course",
    "Bangla Tutorial",
    "Udemy Alternative BD",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  
  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    type: "website",
    locale: "en_US", // Or "bn_BD" if your site is primarily Bangla
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Edu Access BD - Unlock Your Potential",
    description: "Get access to premium skill development courses in Bangladesh. Start learning today!",
    images: [
      {
        url: "/og-image.jpg", // ⚠️ Make sure to add this image in your public folder (1200x630px)
        width: 1200,
        height: 630,
        alt: "Edu Access BD Platform Preview",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Edu Access BD - Premium Courses",
    description: "Best online learning platform in Bangladesh.",
    images: ["/og-image.jpg"],
    creator: "@EduAccessBD", // Replace with your handle
  },

  // Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  // Robots (Crawlers)
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

// 4. VIEWPORT (Mobile Optimization)
export const viewport: Viewport = {
  themeColor: "#2563eb", // Your brand primary color
  width: "device-width",
  initialScale: 1,
};

// 5. JSON-LD (Schema for Google Rich Results)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": SITE_NAME,
  "url": SITE_URL,
  "logo": `${SITE_URL}/logo.png`,
  "sameAs": [
    "https://t.me/+b43-RFdvWTEwMmE1",
    "https://wa.me/qr/TUANFAJEBKJDE1"
  ],
  "description": SITE_DESCRIPTION,
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "BD"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inject Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <Providers>
          {/* ⚠️ ImageKitProvider should usually wrap the children to provide context */}
          <ImageKitProvider urlEndpoint={urlEndpoint}>
            {children}
          </ImageKitProvider>
          
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}