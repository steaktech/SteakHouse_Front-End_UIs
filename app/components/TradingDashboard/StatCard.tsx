import React from 'react';

// Define the types for the component props
interface StatCardProps {
  title: string;
  value: string | number;
}

// Define specific colors for the component
const colors = {
  background: '#F5F3E9',
  gradientFrom: '#7e6329', // Gradient start color
  gradientTo: '#cfb073',   // Gradient end color
  titleText: '#4A4E69',
  valueText: '#4B443C',
};

export const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    // Main container to center the card on the page
    <div className="flex items-center justify-center font-sans">
      {/* Card container with corrected styles for a rounded gradient border */}
      <div
        className="rounded-xl shadow-lg p-4 transform transition-all duration-300 hover:scale-105"
        style={{
          // 1. Set a transparent border. The width (4px) matches the desired border thickness.
          border: '4px solid transparent',
          
          // 2. Layer two backgrounds: the inner color and the outer gradient.
          backgroundImage: `linear-gradient(${colors.background}, ${colors.background}), linear-gradient(to top right, ${colors.gradientFrom}, ${colors.gradientTo})`,
          
          // 3. Define the origin and clipping for the backgrounds to create the border effect.
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',

          // The original box-shadow can remain as is.
          boxShadow: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 2px 4px 0 rgba(255, 255, 255, 0.5), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.1)`,
        }}
      >
        <div className="text-center">
          {/* Title text */}
          <p
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: colors.titleText }}
          >
            Tokens Launched
          </p>
          {/* The count of launched tokens */}
          <p
            className="text-4xl font-bold mt-2"
            style={{
              color: colors.valueText,
              textShadow: '2px 2px 3px rgba(0,0,0,0.2)',
            }}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// Example of how to use it:
// <StatCard title="Tokens Launched" value={2678} />