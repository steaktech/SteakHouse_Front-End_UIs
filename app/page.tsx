'use client';
import Header from "@/app/components/Header";
import TrendingBar from "@/app/components/TrendingBar";
import { TradingDashboard } from "@/app/components/TradingDashboard";
import Footer from "@/app/components/Footer";
import PageSidebar from "@/app/components/TradingDashboard/PageSidebar";

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <Header />
        <TrendingBar />

        {/* PageSidebar is position:fixed, so it's outside the normal flow */}
        <PageSidebar />
        
        {/* Body area: full width since sidebar doesn't take up space */}
        <section className="relative w-full -mt-5 md:-mt-8 lg:-mt-10">
          <TradingDashboard />
        </section>
      </main>
      <Footer />
    </>
  );
}
