import React from 'react';
import { StatCardProps } from './types';

export const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <div className="bg-[#F5F2E9] p-4 rounded-xl shadow-md text-center border border-gray-300">
    <p className="text-sm text-gray-600 font-semibold uppercase tracking-wider">{title}</p>
    <p className="text-4xl font-bold text-[#4A3F35] mt-2">{value}</p>
  </div>
); 