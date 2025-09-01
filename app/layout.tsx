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
        {/* Remix Icon CDN for social and utility icons */}
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[url('/images/homepage-bg.webp')] bg-cover bg-no-repeat flex flex-col min-h-screen`}
        style={{ backgroundPosition: 'center -100px' }}
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