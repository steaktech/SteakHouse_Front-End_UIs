import React from 'react';
import { TradingTokenCard } from './TradingTokenCard';
import type { TokenCardInfoData, TokenCardWrapperProps } from './types';
import styles from './TokenCardWrapper.module.css';

export const TokenCardWrapper: React.FC<TokenCardWrapperProps> = (props) => {
  // Map wrapper props to the TradingTokenCard props with sensible defaults
  const tokenCardProps: TokenCardInfoData = {
    imageUrl: props.imageUrl,
    name: props.name,
    symbol: props.symbol,
    tag: props.tag,
    tagColor: props.tagColor || '#ffe49c',
    description: props.description,
    mcap: props.mcap,
    liquidity: props.liquidity,
    volume: props.volume,
    progress: props.progress,
    token_address: props.token_address,
    tokenData: props.tokenData,
    isLoading: (props as any).isLoading,
    error: (props as any).error,
  };

  return (
    <div className={styles.fullHeightContainer}>
      {/* Wrapper gives the card full height and responsive tweaks via CSS module */}
      <div className="trading-chart-full-height" style={{ height: '100%', display: 'flex', flex: 1 }}>
        <TradingTokenCard {...tokenCardProps} />
      </div>
    </div>
  );
};
