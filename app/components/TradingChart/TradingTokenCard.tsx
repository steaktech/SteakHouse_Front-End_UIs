import React, { useEffect, useRef } from 'react';
import { Globe, Send } from 'lucide-react';
import { TokenCardProps } from '@/app/components/TradingDashboard/types';
import type { FullTokenDataResponse, Trade } from '@/app/types/token';

const TwitterIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 1200 1227" fill="currentColor">
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6902H306.615L611.412 515.685L658.88 583.579L1055.08 1150.31H892.476L569.165 687.854V687.828Z"/>
  </svg>
);

interface TradingTokenCardProps extends TokenCardProps {
  compact?: boolean;
  tokenData?: FullTokenDataResponse | null;
  isLoading?: boolean;
  error?: string | null;
  liveMarketCap?: number;
  liveLastTrade?: Trade;
}

export const TradingTokenCard: React.FC<TradingTokenCardProps> = ({ 
  imageUrl, 
  name, 
  symbol, 
  tag, 
  description, 
  mcap, 
  liquidity, 
  volume, 
  progress,
  compact = false,
  tokenData,
  isLoading,
  error,
  liveMarketCap,
  liveLastTrade,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  // Build display values from API when available, fallback to props
  const displayData = {
    name: tokenData?.tokenInfo?.name || name,
    symbol: tokenData?.tokenInfo?.symbol || symbol,
    imageUrl: tokenData?.tokenInfo?.image_url || imageUrl,
    description: tokenData?.tokenInfo?.bio || description,
    category: tokenData?.tokenInfo?.catagory || tag,
    mcap: typeof liveMarketCap === 'number'
      ? `$${(liveMarketCap / 1000).toFixed(1)}K`
      : (tokenData ? `$${(tokenData.marketCap / 1000).toFixed(1)}K` : mcap),
    volume: (liveLastTrade ?? tokenData?.lastTrade) ? (() => {
      const last = (liveLastTrade ?? tokenData?.lastTrade)!;
      const value = typeof last.usdValue === 'string' ?
        parseFloat(String(last.usdValue).replace(/[^0-9.-]+/g, '')) :
        (last.usdValue || 0);
      return !isNaN(value) ? `$${Number(value).toFixed(2)}` : volume;
    })() : volume,
    liquidity: tokenData?.tokenInfo?.eth_pool !== undefined && tokenData?.tokenInfo?.eth_pool !== null
      ? `${Number(tokenData.tokenInfo.eth_pool).toFixed(2)} ETH`
      : liquidity,
    currentTax: tokenData?.tokenInfo?.curve_starting_tax ?? 3,
    finalTax: tokenData?.tokenInfo?.final_tax_rate ?? 3,
    maxTxPct: tokenData?.tokenInfo?.curve_max_tx && tokenData?.tokenInfo?.total_supply
      ? `${((Number(tokenData.tokenInfo.curve_max_tx) / Number(tokenData.tokenInfo.total_supply)) * 100).toFixed(1)}%`
      : '2.1%',
    calculatedProgress: tokenData?.tokenInfo
      ? (() => {
          const circulating = Number(tokenData.tokenInfo.circulating_supply);
          const cap = Number(tokenData.tokenInfo.graduation_cap_norm);
          return (!isNaN(circulating) && !isNaN(cap) && cap > 0) ? (circulating / cap) * 100 : (progress ?? 0);
        })()
      : (progress ?? 0),
  };

  const formatPercent = (v: number) => {
    return v.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }) + '%';
  };

  const setProgress = (percent: number) => {
    if (!fillRef.current || !trackRef.current || !labelRef.current) return;
    
    const clamped = Math.max(0, Math.min(100, percent));
    fillRef.current.style.width = `${clamped}%`;
    trackRef.current.setAttribute('aria-valuenow', clamped.toFixed(1));
    labelRef.current.textContent = formatPercent(clamped);
  };

  useEffect(() => {
    setTimeout(() => {
      setProgress(displayData.calculatedProgress);
    }, 100);
  }, [displayData.calculatedProgress]);

  return (
    <div 
      style={{
        width: '100%',
        maxWidth: '320px',
        height: compact ? 'auto' : '100%',
        minHeight: compact ? '150px' : '400px',
        position: 'relative',
        borderRadius: '20px',
        background: 'linear-gradient(180deg, #572501, #572501 10%, #572501 58%, #7d3802 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)',
        padding: compact ? '4px 8px 0px' : '16px 16px 12px',
        border: '1px solid rgba(255, 215, 165, 0.4)',
        overflow: 'hidden',
        color: '#fff7ea',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
      
      {/* Banner */}
      <div style={{
        position: 'relative',
        aspectRatio: '3 / 1',
        margin: compact ? '-4px -8px 3px -8px' : '-16px -16px 8px -16px',
        borderRadius: '20px 20px 0 0',
        overflow: 'hidden',
        zIndex: 1,
        flexShrink: 0
      }}>
        {/* Gradient layer */}
        <div style={{
          position: 'absolute',
          inset: '0',
          background: `radial-gradient(
            90% 100% at 50% 0%,
            rgba(255, 218, 150, 0.35),
            rgba(255, 194, 110, 0.2) 45%,
            transparent 75%
          ),
          linear-gradient(180deg, #9a5a2c 0%, #6a3a1c 58%, #52270f 100%)`
        }} />
        {/* Inner bevel layer */}
        <div style={{
          position: 'absolute',
          inset: '0',
          background: `linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.28),
            rgba(255, 255, 255, 0) 28%
          ),
          linear-gradient(0deg, rgba(0, 0, 0, 0.16), rgba(0, 0, 0, 0) 22%)`,
          borderBottom: '1px solid rgba(255, 220, 170, 0.38)',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Header */}
      <div style={{
        marginTop: '1px',
        marginBottom: compact ? '4px' : '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: compact ? '6px' : '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '6px' : '8px' }}>
          <div style={{
            width: compact ? '32px' : '36px',
            height: compact ? '32px' : '36px',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(145deg, #915428, #4a2815)',
            border: '1px solid rgba(255, 215, 165, 0.65)',
            overflow: 'hidden'
          }}>
            <img 
              src={displayData.imageUrl as string} 
              alt={displayData.name as string} 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <h1 style={{
              color: '#feea88',
              fontFamily: '"Sora", "Inter", sans-serif',
              fontWeight: 800,
              fontSize: compact ? '14px' : '16px',
              lineHeight: 1,
              margin: 0
            }}>{displayData.name}</h1>
            <div style={{
              marginTop: '4px',
              fontWeight: 800,
              fontSize: '10px',
              letterSpacing: '1px',
              color: '#ffeed8',
              background: 'linear-gradient(180deg, rgba(255, 231, 190, 0.35), rgba(255, 196, 120, 0.22))',
              border: '1px solid rgba(255, 210, 160, 0.65)',
              padding: '3px 8px',
              borderRadius: '999px',
              maxWidth: 'fit-content'
            }}>{displayData.symbol}</div>
          </div>
        </div>
        <div style={{
          padding: '6px 10px',
          background: 'linear-gradient(180deg, #ffe49c, #ffc96a)',
          color: '#3a200f',
          fontWeight: 800,
          letterSpacing: '0.8px',
          fontSize: '10px',
          borderRadius: '999px',
          border: '1px solid rgba(140, 85, 35, 0.28)'
        }}>{(displayData.category || tag) as string}</div>
      </div>

      {/* Tax Line */}
      <div style={{
        marginTop: compact ? '2px' : '8px',
        marginBottom: compact ? '4px' : '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: compact ? '6px' : '10px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          fontFamily: '"Sora", "Inter", sans-serif',
          fontWeight: 800,
          fontSize: compact ? '12px' : '14px',
          color: '#feea88',
          textShadow: '0 1px 0 rgba(0, 0, 0, 0.18)'
        }}>Tax: {String(displayData.currentTax)}/{String(displayData.finalTax)}</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            background: '#7e4007',
            border: '1px solid rgba(255, 215, 165, 0.7)',
            color: '#fff0de',
            fontWeight: 900,
            fontSize: '9px',
            borderRadius: '8px'
          }}>Current Tax: {String(displayData.currentTax)}/{String(displayData.finalTax)}</span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            background: '#7e4007',
            border: '1px solid rgba(255, 215, 165, 0.7)',
            color: '#fff0de',
            fontWeight: 900,
            fontSize: '9px',
            borderRadius: '8px'
          }}>MaxTX: {displayData.maxTxPct}</span>
        </div>
      </div>

      {/* Description in rounded container */}
      <div style={{
        margin: compact ? '3px 0 4px' : '8px 0 12px',
        padding: compact ? '12px 10px' : '16px 14px',
        borderRadius: compact ? '12px' : '16px',
        border: '1px solid rgba(100, 60, 30, 0.6)',
        background: 'rgba(60, 35, 20, 0.4)',
        color: '#fff1df',
        fontSize: compact ? '12px' : '14px',
        fontWeight: 800,
        lineHeight: 1.3,
        textAlign: 'center'
      }}>
        {displayData.description}
      </div>

      {/* Social Buttons - positioned to align with stat cards below */}
      {!compact && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
          marginBottom: '12px',
          padding: '0 10px 0 6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button style={{
              color: '#fff1dc',
              width: '36px',
              height: '36px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '10px',
              background: 'linear-gradient(180deg, rgba(255, 230, 195, 0.22), rgba(255, 196, 120, 0.16))',
              border: '1px solid rgba(255, 215, 165, 0.5)',
              cursor: 'pointer'
            }}>
              <Send size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button style={{
              color: '#fff1dc',
              width: '36px',
              height: '36px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '10px',
              background: 'linear-gradient(180deg, rgba(255, 230, 195, 0.22), rgba(255, 196, 120, 0.16))',
              border: '1px solid rgba(255, 215, 165, 0.5)',
              cursor: 'pointer'
            }}>
              <TwitterIcon />
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button style={{
              color: '#fff1dc',
              width: '36px',
              height: '36px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '10px',
              background: 'linear-gradient(180deg, rgba(255, 230, 195, 0.22), rgba(255, 196, 120, 0.16))',
              border: '1px solid rgba(255, 215, 165, 0.5)',
              cursor: 'pointer'
            }}>
              <Globe size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Score Section */}
      <div style={{
        marginTop: '0',
        marginBottom: '0',
        background: 'linear-gradient(180deg, #7f4108, #6f3906)',
        border: '1px solid rgba(255, 215, 165, 0.4)',
        borderRadius: '16px',
        padding: '8px 8px 6px 8px',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)'
      }}>
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: compact ? '4px' : '6px',
          marginBottom: compact ? '3px' : '10px'
        }}>
          <div style={{
            background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
            border: '1px solid rgba(255, 210, 160, 0.4)',
            borderRadius: compact ? '10px' : '12px',
            padding: compact ? '6px 7px' : '8px 9px',
            textAlign: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              fontWeight: 800,
              fontSize: compact ? '8px' : '10px',
              letterSpacing: '0.8px',
              color: '#ffe0b6',
              marginBottom: compact ? '3px' : '4px'
            }}>MCAP</div>
            <div style={{
              fontFamily: '"Sora", "Inter", sans-serif',
              fontWeight: 800,
              fontSize: compact ? '12px' : '14px',
              lineHeight: 1.1,
              color: '#fff6e6',
              textShadow: '0 1px 0 rgba(0, 0, 0, 0.18)'
            }}>{displayData.mcap}</div>
          </div>
          <div style={{
            background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
            border: '1px solid rgba(255, 210, 160, 0.4)',
            borderRadius: compact ? '10px' : '12px',
            padding: compact ? '6px 7px' : '8px 9px',
            textAlign: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              fontWeight: 800,
              fontSize: compact ? '8px' : '10px',
              letterSpacing: '0.8px',
              color: '#ffe0b6',
              marginBottom: compact ? '3px' : '4px'
            }}>VOLUME</div>
            <div style={{
              fontFamily: '"Sora", "Inter", sans-serif',
              fontWeight: 800,
              fontSize: compact ? '12px' : '14px',
              lineHeight: 1.1,
              color: '#fff6e6',
              textShadow: '0 1px 0 rgba(0, 0, 0, 0.18)'
            }}>{displayData.volume}</div>
          </div>
          <div style={{
            background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
            border: '1px solid rgba(255, 210, 160, 0.4)',
            borderRadius: compact ? '10px' : '12px',
            padding: compact ? '6px 7px' : '8px 9px',
            textAlign: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              fontWeight: 800,
              fontSize: compact ? '8px' : '10px',
              letterSpacing: '0.8px',
              color: '#ffe0b6',
              marginBottom: compact ? '3px' : '4px'
            }}>LP</div>
            <div style={{
              fontFamily: '"Sora", "Inter", sans-serif',
              fontWeight: 800,
              fontSize: compact ? '12px' : '14px',
              lineHeight: 1.1,
              color: '#fff6e6',
              textShadow: '0 1px 0 rgba(0, 0, 0, 0.18)'
            }}>{displayData.liquidity}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          ref={trackRef}
          style={{
            position: 'relative',
            height: compact ? '32px' : '48px',
            borderRadius: compact ? '16px' : '24px',
            background: 'radial-gradient(100% 120% at 50% 120%, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.35) 40%, rgba(0, 0, 0, 0.35) 70%, rgba(255, 255, 255, 0.08) 100%), linear-gradient(180deg, #9a5a2c, #6a3a1c)',
            boxShadow: compact 
              ? 'inset 0 4px 10px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 6px 16px rgba(0, 0, 0, 0.35)'
              : 'inset 0 6px 14px rgba(0, 0, 0, 0.42), inset 0 2px 0 rgba(255, 255, 255, 0.22), 0 8px 20px rgba(0, 0, 0, 0.35)',
            padding: compact ? '3px' : '4px',
            overflow: 'visible'
          }}
        >
          <div 
            ref={fillRef}
            style={{
              position: 'relative',
              height: compact ? '26px' : '40px',
              width: '0%',
              borderRadius: compact ? '13px' : '20px',
              background: 'linear-gradient(180deg, #ffedae, #ffd96f 55%, #ffc14d 100%)',
              boxShadow: compact 
                ? 'inset 0 1px 0 rgba(255, 255, 255, 0.75), inset 0 -1px 6px rgba(165, 82, 22, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.28), 0 8px 20px rgba(255, 180, 70, 0.52), 0 0 16px 1px rgba(255, 180, 70, 0.58)'
                : 'inset 0 2px 0 rgba(255, 255, 255, 0.75), inset 0 -2px 8px rgba(165, 82, 22, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.28), 0 10px 24px rgba(255, 180, 70, 0.52), 0 0 20px 2px rgba(255, 180, 70, 0.58)',
              overflow: 'hidden',
              transition: 'width 600ms cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          >
            <div 
              ref={labelRef}
              style={{
                position: 'absolute',
                inset: '0',
                display: 'grid',
                placeItems: 'center',
                pointerEvents: 'none',
                fontWeight: 800,
                fontSize: compact ? '12px' : '14px',
                color: '#2b160a',
                textShadow: '0 1px 0 rgba(255, 255, 255, 0.78)',
                mixBlendMode: 'multiply',
                zIndex: 3
              }}
            >0%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
