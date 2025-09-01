import React, { useState } from 'react';

// --- PAGINATION COMPONENTS ---

// Define the types for the Pagination component's props
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Reusable Button component with styles matching the control bar's theme
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
        flex items-center justify-center
        px-6 py-2 bg-[#e7d500] text-[#572401] font-bold
        rounded-full transition-all duration-200 ease-in-out
        border-t-2 border-l-2 border-r-2 border-b-4 border-[#b1782d]
        shadow-[0_5px_15px_rgba(0,0,0,0.2)]
        hover:bg-[#dcd0c4] hover:shadow-[0_3px_10px_rgba(0,0,0,0.2)] hover:-translate-y-px
        active:bg-[#c9bbae] active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.3)] active:translate-y-0.5
        disabled:bg-gray-500 disabled:border-gray-600 disabled:text-gray-700
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:shadow-none disabled:transform-none
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Prev
      </PaginationButton>

      {/* Page Info and Dots */}
      <div className="flex flex-col items-center">
        <span 
          className="text-[#e7d500] font-black text-lg"
          style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}
        >
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex space-x-1.5 mt-2">
          {dots.map((_, index) => (
            <div
              key={index}
              className="w-3 h-3 bg-[#e7d500] rounded-full border-t border-l border-[#733f00] border-b-2 border-r-2 border-[#843b04] shadow-[inset_0_2px_2px_rgba(0,0,0,0.3)]"
            />
          ))}
        </div>
      </div>

      {/* Next Button */}
      <PaginationButton onClick={handleNext} disabled={currentPage === totalPages}>
        Next
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
    <div className="w-full relative">
      {/* The fade effect, positioned absolutely above the main content block */}
      <div 
        aria-hidden="true"
        className="absolute bottom-full inset-x-0 h-32 bg-gradient-to-t from-[#ebd6b4] to-transparent pointer-events-none"
      />

      {/* Control buttons section with gradient background */}
      <div className="bg-gradient-to-b from-[#843b04] to-[#572401] p-4 flex items-center justify-between border-b border-white/20">
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
