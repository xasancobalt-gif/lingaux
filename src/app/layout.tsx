import type { Metadata } from "next";
import { Cormorant, Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400","500","600","700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300","400","500","600","700","800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lingaux.app"),
  title: {
    default: "LINGAUX — Speak • Learn • Progress | Master Communication in 30 Days",
    template: "%s | LINGAUX"
  },
  description: "The futuristic 3D OS to master communication. Record. Review. Transform. Join 12,000+ speaking with confidence. Free to start, Pro to dominate.",
  keywords: ["communication", "public speaking", "30 day plan", "speaking coach", "lingaux", "learn to speak", "3d learning"],
  manifest: "/manifest.json",
  icons: { icon: "/brand/lingaux-logo.png", apple: "/brand/lingaux-logo.png" },
  openGraph: {
    title: "LINGAUX — Speak • Learn • Progress",
    description: "Record 5 mins. Get AI Triple-Scan. Transform in 30 days. 3D learning OS.",
    type: "website",
    images: ["/brand/lingaux-logo.png"],
  },
  twitter: { card: "summary_large_image", title: "LINGAUX — Speak • Learn • Progress", description: "Master communication in 30 days", images: ["/brand/lingaux-logo.png"] }
};

import { Providers } from "@/components/providers";
import Chatbot from "@/components/Chatbot";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#06060A] text-white selection:bg-[#A16207]/30 selection:text-white">
        <Providers>{children}<Chatbot/></Providers>
      </body>
    </html>
  );
}
