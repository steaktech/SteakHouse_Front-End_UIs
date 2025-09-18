import React from 'react';
import { TokenCard } from '@/app/components/TradingDashboard/TokenCard';
import { TokenCardProps } from '@/app/components/TradingDashboard/types';
import styles from './TokenCardWrapper.module.css';

interface TokenCardWrapperProps extends TokenCardProps {}

export const TokenCardWrapper: React.FC<TokenCardWrapperProps> = (props) => {
  return (
    <div className={styles.fullHeightContainer}>
      <TokenCard {...props} />
    </div>
  );
};
