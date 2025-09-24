import React from 'react';
import { TokenCard } from '@/app/components/TradingDashboard/TokenCard';
import { TokenCardProps } from '@/app/components/TradingDashboard/types';
import { TokenCardWrapperProps } from './types';
import styles from './TokenCardWrapper.module.css';

export const TokenCardWrapper: React.FC<TokenCardWrapperProps> = (props) => {
  // Ensure all required props are provided with defaults
  const tokenCardProps: TokenCardProps = {
    ...props,
    tagColor: props.tagColor || '#ffe49c',
    token_address: props.token_address || '',
    circulating_supply: props.circulating_supply?.toString(),
    graduation_cap: props.graduation_cap?.toString(),
  };

  return (
    <div className={styles.fullHeightContainer}>
      <TokenCard {...tokenCardProps} />
    </div>
  );
};
