import React from 'react';
import { TokenCard } from '@/app/components/TradingDashboard/TokenCard';
import { TokenCardWrapperProps } from './types';
import styles from './TokenCardWrapper.module.css';

export const TokenCardWrapper: React.FC<TokenCardWrapperProps> = (props) => {
  return (
    <div className={styles.fullHeightContainer}>
      <TokenCard {...props} />
    </div>
  );
};
