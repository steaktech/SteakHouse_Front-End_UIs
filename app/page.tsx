'use client';
import Header from "@/app/components/Header";
import TrendingBar from "@/app/components/TrendingBar";
import { TradingDashboard } from "@/app/components/TradingDashboard";
import Footer from "@/app/components/Footer";
import PageSidebar from "@/app/components/PageSidebar";

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <Header />
        <TrendingBar />

        {/* Body area: sidebar on the left between TrendingBar and Footer */}
        <section className="relative flex items-stretch gap-0 w-full">
          <PageSidebar />
          <div className="flex-1 min-w-0">
            <TradingDashboard />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
