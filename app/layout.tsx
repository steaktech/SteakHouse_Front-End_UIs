import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LoadingWrapper from "./components/LoadingWrapper";
import WagmiProviderWrapper from "./lib/providers/WagmiProvider";
import { ToastProvider } from "./lib/providers/ToastProvider";
import { ToastContainer } from "./components/UI/ToastContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#1a0f08] flex flex-col min-h-screen`}
      >
        <WagmiProviderWrapper>
          <ToastProvider>
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