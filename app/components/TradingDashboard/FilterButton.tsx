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
    className={`${styles['btn-3']} flex items-center justify-center space-x-2 font-bold transition-all duration-150 ease-in-out ${
      active ? 'ring-2 ring-[#c87414] ring-opacity-50' : ''
    }`}
  >
    <div className={styles.marbling}></div>
    {icon}
    <span>{label}</span>
  </button>
);