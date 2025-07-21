'use client';
import Header from "./components/Header";
import TrendingBar from "./components/TrendingBar";
import { TradingDashboard } from "./components/TradingDashboard";
import BottomControlBar from "./components/BottomControlBar";
import Footer from "./components/Footer";

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
