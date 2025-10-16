'use client';
import Header from "@/app/components/Header";
import TrendingBar from "@/app/components/TrendingBar";
import { TradingDashboard } from "@/app/components/TradingDashboard";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <Header />
        <TrendingBar />
        <TradingDashboard />
      </main>
      <Footer />
    </>
  );
}
