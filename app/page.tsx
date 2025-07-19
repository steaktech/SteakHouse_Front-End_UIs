import Header from "./components/header";
import TrendingBar from "./components/trendingbar";
import { TradingDashboard } from "./components/TradingDashboard";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <TrendingBar />
      <TradingDashboard />
    </div>
  );
}
