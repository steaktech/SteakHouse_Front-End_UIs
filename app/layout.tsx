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
import { ThemeProvider } from "./contexts/ThemeContext";

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
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        style={{ backgroundColor: 'var(--theme-bg-primary)' }}
      >
        <ThemeProvider>
          <WagmiProviderWrapper>
            <ToastProvider>
              <ReferralHandler />
              <LoadingWrapper>
                {children}
              </LoadingWrapper>
              <ToastContainer />
            </ToastProvider>
          </WagmiProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}