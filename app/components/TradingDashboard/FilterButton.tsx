import React from 'react';
import { FilterButtonProps } from './types';
import styles from '../UI/Botton.module.css';

export const FilterButton: React.FC<FilterButtonProps> = ({ 
  icon, 
  label, 
  active = false, 
  onClick 
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`${styles['btn-3']} flex items-center justify-center gap-2 font-bold transition-all duration-300 ease-in-out ${
      active 
        ? 'ring-2 ring-[#eab000] ring-opacity-70 !bg-gradient-to-br !from-[#73420f] !to-[#4a2a0a] !text-[#fff5d6] !border-[#eab000] !shadow-xl !shadow-[#eab000]/30' 
        : ''
    }`}
    style={{
      ...(active && {
        transform: 'translateY(-2px) scale(1.02)',
        boxShadow: '0 6px 20px rgba(234, 176, 0, 0.4), 0 2px 10px rgba(0, 0, 0, 0.3), 0 0 15px rgba(234, 176, 0, 0.2)'
      })
    }}
  >
    <div className={styles.marbling}></div>
    <div className="flex items-center gap-2 relative z-10">
      {icon}
      <span className="font-semibold tracking-wide">{label}</span>
    </div>
  </button>
);
