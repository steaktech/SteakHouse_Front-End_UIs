'use client';
import Header from "@/app/components/Header";
import TrendingBar from "@/app/components/TrendingBar";
import FourMemeStyleHomepage from "@/app/components/FourMemeStyleHomepage";
import Footer from "@/app/components/Footer";
import BottomControlBar from "@/app/components/BottomControlBar";
import { useTokens } from "@/app/hooks/useTokens";

export default function Home() {
  const { pagination, goToPage, nextPage, previousPage } = useTokens();

  return (
    <>
      <main className="flex-1">
        <Header />
        <TrendingBar />
        <FourMemeStyleHomepage />
      </main>
      <BottomControlBar
        currentPage={pagination.currentPage}
        hasMore={pagination.hasMore}
        nextPage={pagination.nextPage}
        prevPage={pagination.prevPage}
        onPageChange={goToPage}
        onNextPage={nextPage}
        onPreviousPage={previousPage}
      />
      <Footer />
    </>
  );
}
