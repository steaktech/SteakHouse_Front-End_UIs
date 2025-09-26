import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LoadingWrapper from "./components/LoadingWrapper";
import WagmiProviderWrapper from "./lib/providers/WagmiProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trading Platform",
  description: "Advanced Trading Platform with Token Creation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Remix Icon CDN for social and utility icons */}
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col`}
        style={{ 
          minHeight: '100vh',
          background: `url('/images/homepage-bg.webp') center -50px / cover no-repeat fixed`,
          backgroundAttachment: 'fixed'
        }}
      >
        <WagmiProviderWrapper>
          <LoadingWrapper>
            {children}
          </LoadingWrapper>
        </WagmiProviderWrapper>
      </body>
    </html>
  );
}