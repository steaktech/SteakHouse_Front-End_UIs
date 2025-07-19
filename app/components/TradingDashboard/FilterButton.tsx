import React from 'react';
import { FilterButtonProps } from './types';

export const FilterButton: React.FC<FilterButtonProps> = ({ icon, label, active }) => (
  <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
      active 
      ? 'bg-yellow-400 text-black' 
      : 'bg-[#4A3F35] text-yellow-200 hover:bg-opacity-80'
    }`}>
    {icon}
    <span>{label}</span>
  </button>
); 