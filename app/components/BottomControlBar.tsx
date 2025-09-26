import React, { useState } from 'react';

// --- PAGINATION COMPONENTS ---

// Define the types for the Pagination component's props
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Pagination Button matching footer's exact golden styling
const PaginationButton: React.FC<{
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, disabled, children, className = '' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        appearance-none inline-flex items-center justify-center gap-2
px-4 py-2.5 font-bold text-sm whitespace-nowrap
        rounded-full border transition-all duration-150 ease-out
        
        /* Exact footer button styling - primary variant */
        bg-gradient-to-b from-[#ffd99c] to-[#ffb457]
        border-[rgba(255,171,77,0.45)] text-[#5b2d05]
        shadow-[0_12px_28px_rgba(255,140,40,0.25),0_0_0_2px_rgba(255,188,100,0.12)_inset]
        
        /* Hover state matching footer */
        hover:-translate-y-0.5 hover:bg-gradient-to-b hover:from-[#ffe4a8] hover:to-[#ffc366]
        hover:border-[rgba(255,171,77,0.6)] hover:shadow-[0_14px_32px_rgba(255,140,40,0.35),0_0_0_2px_rgba(255,188,100,0.18)_inset]
        
        /* Active state */
        active:translate-y-0 active:shadow-[0_6px_20px_rgba(255,140,40,0.2),0_0_0_2px_rgba(255,188,100,0.08)_inset]
        
        /* Disabled state */
        disabled:from-[#8a7a6a] disabled:to-[#6b5b47] disabled:border-[rgba(139,69,19,0.3)]
        disabled:text-[rgba(255,255,255,0.5)] disabled:opacity-60 disabled:cursor-not-allowed
        disabled:shadow-[0_2px_4px_rgba(0,0,0,0.3)] disabled:transform-none
        
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// The main Pagination logic and UI component
const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Create an array for the decorative dots
  const dots = Array.from({ length: 5 });

  return (
    <div className="flex items-center justify-center space-x-4">
      {/* Previous Button */}
      <PaginationButton onClick={handlePrevious} disabled={currentPage === 1}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-black text-base">Prev</span>
      </PaginationButton>

      {/* Page Info and Dots */}
      <div className="flex flex-col items-center mx-6">
        {/* Page info styled like footer social icons with smooth animation */}
        <div
          className="
            px-6 py-3 rounded-xl font-bold text-sm
            bg-gradient-to-b from-[#ffdca1] to-[#ffb95b]
            border border-[rgba(255,171,77,0.45)] text-[#5b2d05]
            shadow-[0_6px_16px_rgba(0,0,0,0.35),0_0_0_2px_rgba(255,188,100,0.1)_inset]
            transition-all duration-300 ease-in-out
          "
        >
          <span className="inline-block transition-all duration-300 ease-in-out font-black">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Indicator dots styled like mini social icons */}
        <div className="flex space-x-2 mt-3">
          {dots.map((_, index) => {
            const isActive = index === Math.floor((currentPage - 1) % 5);
            return (
              <div
                key={index}
                className={`
                  w-2.5 h-2.5 rounded-lg transition-all duration-200 ease-out cursor-pointer
                  bg-gradient-to-b border border-[rgba(255,171,77,0.45)]
                  shadow-[0_3px_8px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,188,100,0.1)_inset]
                  hover:-translate-y-0.5 hover:shadow-[0_5px_12px_rgba(255,140,40,0.28),0_0_0_1px_rgba(255,188,100,0.16)_inset]
                  ${isActive
                    ? 'from-[#ffdca1] to-[#ffb95b] scale-125 shadow-[0_4px_10px_rgba(255,140,40,0.4),0_0_0_1px_rgba(255,188,100,0.2)_inset]'
                    : 'from-[#ffcf88] to-[#ffab50]'
                  }
                `}
              />
            );
          })}
        </div>
      </div>

      {/* Next Button */}
      <PaginationButton onClick={handleNext} disabled={currentPage === totalPages}>
        <span className="font-black text-base">Next</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </PaginationButton>
    </div>
  );
};

// Define the type for our SVG icon props
type IconProps = {
  className?: string;
};



// The Bottom Control Bar component
export default function BottomControlBar() {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const TOTAL_PAGES = 12; // Example total pages

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full relative" style={{marginTop: '0', paddingTop: '0'}}>
      {/* Control buttons section with gradient background */}
      <div className="bg-gradient-to-b from-[#843b04] to-[#572401] p-4 flex items-center justify-between border-b border-white/20" style={{marginTop: '0'}}>
        {/* Left section - Social Icons */}
        <div className="flex-1 flex items-center justify-start space-x-4 pl-4">
        </div>

        {/* Center section - PAGINATION CONTROLS */}
        <div className="flex justify-center items-center">
          <Pagination
            currentPage={currentPage}
            totalPages={TOTAL_PAGES}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Right section - Footer Links */}
        <div className="flex-1 flex items-center justify-end space-x-6 pr-4">
        </div>
      </div>
    </div>
  );
}
