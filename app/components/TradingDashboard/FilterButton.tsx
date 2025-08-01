import React from 'react';
import { FilterButtonProps } from './types';

export const FilterButton: React.FC<FilterButtonProps> = ({ icon, label, active }) => (
  <button
    className={`
      flex items-center justify-center space-x-2 
      px-4 py-2 rounded-lg font-bold border-3
      transition-all duration-150 ease-in-out
      ${
        active
          ? `bg-gradient-to-b from-yellow-400 to-amber-500
             text-yellow-950 border-amber-600
             shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),_inset_0_-3px_4px_rgba(180,83,9,0.4)]`
          : `bg-gradient-to-b from-[#a47105] to-[#bb892a]
             text-[#f6f86c] border-[#925929]
             shadow-[inset_0_2px_4px_rgba(253,224,71,0.5),_inset_0_-2px_4px_rgba(118,69,10,0.4)]
             hover:from-yellow-500 hover:to-yellow-600
             active:shadow-[inset_0_3px_5px_rgba(118,69,10,0.5)]
             active:from-yellow-600 active:to-yellow-700`
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);