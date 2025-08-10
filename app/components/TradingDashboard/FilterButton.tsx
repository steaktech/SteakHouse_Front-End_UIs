import React from 'react';
import { FilterButtonProps } from './types';

export const FilterButton: React.FC<FilterButtonProps> = ({ icon, label, active }) => (
  <button
    className={`
      flex items-center justify-center space-x-2 
      px-3 py-1.5 rounded-md text-sm border-1 md:px-4 md:py-2 md:rounded-lg md:text-base md:border-1 font-bold
      transition-all duration-150 ease-in-out
      backdrop-blur-sm
      ${
        active
          ? `bg-gradient-to-b from-[#401c03]/95 to-[#401c03]/95
             text-yellow-950 border-[#977d0b]
             shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),_inset_0_-3px_4px_rgba(180,83,9,0.4)]`
          : `bg-gradient-to-b from-[#472005]/80 to-[#451f02]/50
             text-yellow-500 border-yellow-500
             shadow-[inset_0_2px_4px_rgba(253,224,71,0.5),_inset_0_-2px_4px_rgba(118,69,10,0.4)]
             hover:from-yellow-500/80 hover:to-yellow-600/80
             active:shadow-[inset_0_3px_5px_rgba(118,69,10,0.5)] 
             active:from-yellow-600/90 active:to-yellow-700/90`
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);