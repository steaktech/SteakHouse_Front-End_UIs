import React from 'react';
import { FilterButtonProps } from './types';
import styles from '../UI/Botton.module.css';

export const FilterButton: React.FC<FilterButtonProps> = ({ icon, label, active }) => (
  <button
    type="button"
    className={`${styles['btn-3']} flex items-center justify-center space-x-2 font-bold transition-all duration-150 ease-in-out`}
  >
    <div className={styles.marbling}></div>
    {icon}
    <span>{label}</span>
  </button>
);