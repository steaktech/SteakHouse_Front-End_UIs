import React from 'react';

// --- PAGINATION COMPONENTS ---

// Define the types for the Pagination component's props
interface PaginationProps {
  currentPage: number;
  hasMore: boolean;
  nextPage: number | null;
  prevPage: number | null;
  onPageChange: (page: number) => void;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
}

// Helper to generate page numbers based on available data
const getPageNumbers = (current: number, hasMore: boolean) => {
  const pages: (number | string)[] = [1];

  // If current is far from 1, add dots
  if (current > 3) {
    pages.push('...');
  }

  // Add previous page if it's not 1 (and not covered by the gap)
  if (current > 2) {
    pages.push(current - 1);
  }

  // Add current page if it's not 1
  if (current !== 1) {
    pages.push(current);
  }

  // Add next page if available
  if (hasMore) {
    pages.push(current + 1);
    // Add dots to indicate more pages exist beyond the immediate next
    pages.push('...');
  }

  return pages;
};

// Unified Button Component for Pagination (Arrows and Numbers)
const PageButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, disabled, active, children, className = '' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        min-w-[40px] h-[40px] flex items-center justify-center rounded-lg font-bold text-sm transition-all duration-200
        ${active
          ? 'bg-gradient-to-b from-[#ffd99c] to-[#ffb457] text-[#5b2d05] shadow-[0_0_10px_rgba(255,180,87,0.4)] scale-105 border border-[#ffb457]'
          : 'bg-[#1a1108] border border-[#572401] text-[#ffb457] hover:border-[#ffb457] hover:bg-[#2a1d10] hover:text-[#ffd99c]'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed hover:border-[#572401] hover:bg-[#1a1108] hover:text-[#ffb457]' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// The main Pagination logic and UI component
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  hasMore,
  nextPage,
  prevPage,
  onPageChange,
  onNextPage,
  onPreviousPage
}) => {
  const handlePrevious = () => {
    if (onPreviousPage) {
      onPreviousPage();
    } else if (prevPage) {
      onPageChange(prevPage);
    }
  };

  const handleNext = () => {
    if (onNextPage) {
      onNextPage();
    } else if (nextPage) {
      onPageChange(nextPage);
    }
  };

  const pages = getPageNumbers(currentPage, hasMore);

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      <PageButton onClick={handlePrevious} disabled={!prevPage}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </PageButton>

      {/* Page Numbers */}
      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`dots-${index}`} className="text-[#ffb457] font-bold px-1 select-none">
              ...
            </span>
          );
        }

        return (
          <PageButton
            key={page}
            active={page === currentPage}
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </PageButton>
        );
      })}

      {/* Next Button */}
      <PageButton onClick={handleNext} disabled={!hasMore || !nextPage}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </PageButton>
    </div>
  );
};

// Define the props for the BottomControlBar component
interface BottomControlBarProps {
  currentPage: number;
  hasMore: boolean;
  nextPage: number | null;
  prevPage: number | null;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

// The Bottom Control Bar component
export default function BottomControlBar({
  currentPage,
  hasMore,
  nextPage,
  prevPage,
  onPageChange,
  onNextPage,
  onPreviousPage
}: BottomControlBarProps) {

  return (
    <div className="w-full flex justify-center items-center py-4">
      <Pagination
        currentPage={currentPage}
        hasMore={hasMore}
        nextPage={nextPage}
        prevPage={prevPage}
        onPageChange={onPageChange}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
      />
    </div>
  );
}