import React from 'react';
import { TokenCard } from '@/app/components/TradingDashboard/TokenCard';
import { TokenCardProps } from '@/app/components/TradingDashboard/types';

interface TokenCardWrapperProps extends TokenCardProps {}

export const TokenCardWrapper: React.FC<TokenCardWrapperProps> = (props) => {
  return (
    <div 
      style={{
        height: '100%',
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '0',
        flex: 1
      }}
    >
      <style jsx global>{`
        .trading-chart-full-height .tokenCard {
          height: 100% !important;
          min-height: 0 !important;
          max-height: none !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-start !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
          flex: 1 !important;
          width: 100% !important;
          padding: clamp(8px, 2vh, 22px) clamp(12px, 2.5vw, 22px) clamp(6px, 1.5vh, 18px) !important;
        }
        
        /* Responsive banner */
        .trading-chart-full-height .tokenBanner {
          height: clamp(50px, 12vh, 90px) !important;
          margin: clamp(-8px, -2vh, -22px) clamp(-12px, -2.5vw, -22px) clamp(6px, 1.5vh, 12px) clamp(-12px, -2.5vw, -22px) !important;
        }
        
        /* Header section */
        .trading-chart-full-height .header {
          margin-top: clamp(1px, 0.3vh, 2px) !important;
          margin-bottom: clamp(4px, 1vh, 8px) !important;
          gap: clamp(6px, 1.2vw, 12px) !important;
        }
        
        .trading-chart-full-height .avatar {
          width: clamp(30px, 5vw, 48px) !important;
          height: clamp(30px, 5vw, 48px) !important;
        }
        
        .trading-chart-full-height .nameBlock .name {
          font-size: clamp(14px, 2.8vw, 22px) !important;
          line-height: 1.1 !important;
        }
        
        .trading-chart-full-height .nameBlock .ticker {
          margin-top: clamp(2px, 0.5vh, 6px) !important;
          padding: clamp(3px, 0.6vh, 5px) clamp(6px, 1.2vw, 10px) !important;
          font-size: clamp(9px, 1.4vw, 12px) !important;
        }
        
        .trading-chart-full-height .badge {
          padding: clamp(4px, 1vh, 8px) clamp(8px, 1.6vw, 14px) !important;
          font-size: clamp(9px, 1.4vw, 12px) !important;
        }
        
        /* Tax section */
        .trading-chart-full-height .taxLine {
          margin-top: clamp(4px, 1vh, 12px) !important;
          margin-bottom: clamp(2px, 0.5vh, 4px) !important;
          gap: clamp(4px, 1vw, 10px) !important;
        }
        
        .trading-chart-full-height .taxStrong {
          font-size: clamp(12px, 2.2vw, 18px) !important;
        }
        
        .trading-chart-full-height .taxChips .chip {
          padding: clamp(3px, 0.7vh, 6px) clamp(5px, 1.2vw, 10px) !important;
          margin-left: clamp(2px, 0.6vw, 6px) !important;
          font-size: clamp(9px, 1.4vw, 12px) !important;
          border-radius: clamp(5px, 1.2vw, 10px) !important;
        }
        
        /* Description - flexible with responsive text */
        .trading-chart-full-height .desc {
          flex: 1 1 auto !important;
          display: flex !important;
          align-items: center !important;
          min-height: 0 !important;
          margin: clamp(4px, 1vh, 10px) 0 clamp(6px, 1.2vh, 14px) !important;
          font-size: clamp(11px, 2vw, 14.5px) !important;
          line-height: clamp(1.3, 1.44, 1.6) !important;
        }
        
        /* Social buttons */
        .trading-chart-full-height .socials {
          gap: clamp(5px, 1.2vw, 10px) !important;
          margin-bottom: clamp(6px, 1.5vh, 16px) !important;
        }
        
        .trading-chart-full-height .socialBtn {
          width: clamp(24px, 4.5vw, 36px) !important;
          height: clamp(24px, 4.5vw, 36px) !important;
          border-radius: clamp(6px, 1.5vw, 12px) !important;
        }
        
        /* Score section */
        .trading-chart-full-height .score {
          margin-top: auto !important;
          padding: clamp(8px, 2vh, 14px) !important;
          border-radius: clamp(12px, 2.5vw, 20px) !important;
        }
        
        .trading-chart-full-height .scoreStats {
          gap: clamp(3px, 0.8vw, 8px) !important;
          margin-bottom: clamp(6px, 1.5vh, 12px) !important;
        }
        
        .trading-chart-full-height .scoreStats .stat {
          padding: clamp(5px, 1.2vh, 10px) clamp(6px, 1.5vw, 12px) !important;
          border-radius: clamp(8px, 2vw, 14px) !important;
        }
        
        .trading-chart-full-height .scoreStats .statLabel {
          font-size: clamp(8px, 1.4vw, 12px) !important;
          margin-bottom: clamp(2px, 0.5vh, 6px) !important;
        }
        
        .trading-chart-full-height .scoreStats .statValue {
          font-size: clamp(12px, 2.2vw, 18px) !important;
        }
        
        /* Progress bar */
        .trading-chart-full-height .track {
          height: clamp(35px, 8vh, 64px) !important;
          border-radius: clamp(16px, 4vw, 28px) !important;
          padding: clamp(3px, 0.8vh, 6px) !important;
        }
        
        .trading-chart-full-height .fill {
          height: clamp(29px, 7vh, 52px) !important;
          border-radius: clamp(13px, 3.5vw, 22px) !important;
        }
        
        .trading-chart-full-height .label {
          font-size: clamp(12px, 2.2vw, 18px) !important;
        }
        
        /* Fixed sections - no flex grow */
        .trading-chart-full-height .tokenBanner,
        .trading-chart-full-height .header,
        .trading-chart-full-height .taxLine,
        .trading-chart-full-height .socials,
        .trading-chart-full-height .score {
          flex-shrink: 0 !important;
        }
        
        /* Responsive breakpoints for extreme cases */
        @media (max-height: 400px) {
          .trading-chart-full-height .tokenCard {
            padding: 6px 10px 4px !important;
          }
          .trading-chart-full-height .desc {
            font-size: 10px !important;
            line-height: 1.2 !important;
          }
        }
        
        @media (min-height: 800px) {
          .trading-chart-full-height .tokenCard {
            padding: 20px 24px 16px !important;
          }
        }
        
        @media (max-width: 300px) {
          .trading-chart-full-height .desc {
            font-size: 10px !important;
          }
        }
      `}</style>
      <div className="trading-chart-full-height" style={{ height: '100%', display: 'flex', flex: 1 }}>
        <TokenCard {...props} />
      </div>
    </div>
  );
};
