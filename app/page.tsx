'use client';
import Header from "@/app/components/Header";
import TrendingBar from "@/app/components/TrendingBar";
import { TradingDashboard } from "@/app/components/TradingDashboard";
import BottomControlBar from "@/app/components/BottomControlBar";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <TrendingBar />
      <TradingDashboard />
      <BottomControlBar />
      <Footer />
    </div>
  );
}
