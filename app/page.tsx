import Header from "./components/header";
import TrendingBar from "./components/trendingbar";
import { TradingDashboard } from "./components/TradingDashboard";
import BottomControlBar from "./components/BottomControlBar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <TrendingBar />
      <TradingDashboard />
      <BottomControlBar />
    </div>
  );
}
