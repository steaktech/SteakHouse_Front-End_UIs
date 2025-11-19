import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Fredoka,
  Space_Grotesk,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import LoadingWrapper from "./components/LoadingWrapper";
import WagmiProviderWrapper from "./lib/providers/WagmiProvider";
import { ToastProvider } from "./lib/providers/ToastProvider";
import { ToastContainer } from "./components/UI/ToastContainer";
import ReferralHandler from "./components/ReferralHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pumpDisplay = Fredoka({
  variable: "--font-pump-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const degenGrotesk = Space_Grotesk({
  variable: "--font-degen-grotesk",
  subsets: ["latin"],
});

const uiInter = Inter({
  variable: "--font-ui-inter",
  subsets: ["latin"],
});

const uiMono = JetBrains_Mono({
  variable: "--font-ui-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Devs Kitchen - Launch your token today for $3",
  description: "Advanced Trading Platform with Token Creation",
  icons: {
    icon: "/images/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Remix Icon CDN for social and utility icons */}
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pumpDisplay.variable} ${degenGrotesk.variable} ${uiInter.variable} ${uiMono.variable} antialiased bg-[url('/images/homepage-bg.webp')] bg-cover bg-center bg-no-repeat flex flex-col min-h-screen`}
      >
        <WagmiProviderWrapper>
          <ToastProvider>
            <ReferralHandler />
            <LoadingWrapper>
              {children}
            </LoadingWrapper>
            <ToastContainer />
          </ToastProvider>
        </WagmiProviderWrapper>
      </body>
    </html>
  );
}