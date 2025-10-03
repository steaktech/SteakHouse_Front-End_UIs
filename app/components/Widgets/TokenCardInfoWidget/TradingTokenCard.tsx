import React, { useEffect, useRef, useState } from 'react';
import { Globe, Send, Copy } from 'lucide-react';
import { TokenCardInfoData } from './types';

const TwitterIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 1200 1227" fill="currentColor">
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6902H306.615L611.412 515.685L658.88 583.579L1055.08 1150.31H892.476L569.165 687.854V687.828Z"/>
  </svg>
);

export const TradingTokenCard: React.FC<TokenCardInfoData> = ({ 
  imageUrl, 
  name, 
  symbol, 
  tag, 
  description, 
  mcap, 
  liquidity, 
  volume, 
  progress = 75,
  tokenData,
  isLoading,
  error
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  
  // Use API data if available, otherwise use props
  const displayData = {
    name: tokenData?.tokenInfo?.name || name,
    symbol: tokenData?.tokenInfo?.symbol || symbol,
    imageUrl: tokenData?.tokenInfo?.image_url || imageUrl,
    description: tokenData?.tokenInfo?.bio || description,
    mcap: tokenData ? `$${(tokenData.marketCap / 1000).toFixed(1)}K` : mcap,
    // For volume, we should ideally use 24h volume data, but for now using last trade value
    volume: tokenData?.lastTrade ? 
      (() => {
        const value = typeof tokenData.lastTrade.usdValue === 'string' ? 
          parseFloat(tokenData.lastTrade.usdValue.replace(/[^0-9.-]+/g, '')) : 
          (tokenData.lastTrade.usdValue || 0);
        return !isNaN(value) ? `$${value.toFixed(2)}` : '$0.00';
      })() : volume,
    liquidity: tokenData?.tokenInfo?.eth_pool ? 
      `${Number(tokenData.tokenInfo.eth_pool).toFixed(2)} ETH` : liquidity,
    category: tokenData?.tokenInfo?.catagory || tag,
    finalTax: tokenData?.tokenInfo?.final_tax_rate || 3,
    currentTax: tokenData?.tokenInfo?.curve_starting_tax || 3,
    maxTx: tokenData?.tokenInfo?.curve_max_tx ? 
      `${((Number(tokenData.tokenInfo.curve_max_tx) / Number(tokenData.tokenInfo.total_supply)) * 100).toFixed(1)}%` : '2.1%',
    // Calculate progress based on API data
    calculatedProgress: tokenData?.tokenInfo ? 
      (() => {
        const circulating = Number(tokenData.tokenInfo.circulating_supply);
        const cap = Number(tokenData.tokenInfo.graduation_cap_norm);
        return (!isNaN(circulating) && !isNaN(cap) && cap > 0) ? (circulating / cap) * 100 : 0;
      })() : progress,
    twitter: tokenData?.tokenInfo?.twitter,
    telegram: tokenData?.tokenInfo?.telegram,
    website: tokenData?.tokenInfo?.website,
    tokenAddress: tokenData?.tokenInfo?.token_address || ''
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

  const handleCopyToken = async () => {
    if (displayData.tokenAddress) {
      try {
        await navigator.clipboard.writeText(displayData.tokenAddress);
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
      } catch (err) {
        console.error('Failed to copy token address:', err);
      }
    }
  };

  // Handle responsive sizing
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setProgress(displayData.calculatedProgress);
    }, 100);
  }, [displayData.calculatedProgress]);

  // Handle loading state
  if (isLoading) {
    return (
      <div 
        style={{
          width: '100%',
          maxWidth: isDesktop ? '420px' : '100%',
          height: isDesktop ? '100%' : 'clamp(520px, 85vh, 650px)',
          minHeight: isDesktop ? '100%' : 'clamp(520px, 85vh, 650px)',
          position: 'relative',
          borderRadius: 'clamp(18px, 2.5vw, 26px)',
          background: 'linear-gradient(180deg, #572501, #572501 10%, #572501 58%, #7d3802 100%)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          padding: 'clamp(16px, 3vh, 22px) clamp(18px, 3vw, 22px) clamp(14px, 2.5vh, 18px)',
          border: '1px solid rgba(255, 215, 165, 0.4)',
          color: '#fff7ea',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px'
        }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid rgba(254, 234, 136, 0.3)',
          borderTop: '3px solid #feea88',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{
          color: '#feea88',
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          fontWeight: 600
        }}>Loading token data...</div>
      </div>
    );
  }

  return (
    <div 
      style={{
        width: '100%',
        maxWidth: isDesktop ? '420px' : '100%',
        height: isDesktop ? '100%' : 'clamp(520px, 85vh, 650px)',
        minHeight: isDesktop ? '100%' : 'clamp(520px, 85vh, 650px)',
        position: 'relative',
        borderRadius: 'clamp(18px, 2.5vw, 26px)',
        background: 'linear-gradient(180deg, #572501, #572501 10%, #572501 58%, #7d3802 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        padding: 'clamp(16px, 3vh, 22px) clamp(18px, 3vw, 22px) clamp(14px, 2.5vh, 18px)',
        border: '1px solid rgba(255, 215, 165, 0.4)',
        overflow: 'hidden',
        color: '#fff7ea',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        boxSizing: 'border-box'
      }}>
      
      {/* Banner - Slightly increased bottom margin */}
      <div style={{
        position: 'relative',
        aspectRatio: '3 / 1',
        margin: `clamp(-16px, -3vh, -22px) clamp(-18px, -3vw, -22px) clamp(4px, 1vh, 8px) clamp(-18px, -3vw, -22px)`,
        borderRadius: 'clamp(18px, 2.5vw, 26px) clamp(18px, 2.5vw, 26px) 0 0',
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

      {/* Header - Better spacing */}
      <div style={{
        marginTop: 'clamp(2px, 0.4vh, 4px)',
        marginBottom: 'clamp(4px, 0.8vh, 6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'clamp(6px, 1.2vw, 10px)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.2vw, 10px)' }}>
          <div style={{
            width: 'clamp(36px, 5vw, 44px)',
            height: 'clamp(36px, 5vw, 44px)',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(145deg, #915428, #4a2815)',
            border: '1px solid rgba(255, 215, 165, 0.65)',
            overflow: 'hidden'
          }}>
            <img 
              src={displayData.imageUrl} 
              alt={displayData.name} 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <h1 style={{
              color: '#feea88',
              fontFamily: '"Sora", "Inter", sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(14px, 2.8vw, 20px)',
              lineHeight: 1,
              margin: 0
            }}>{displayData.name}</h1>
            <div style={{
              marginTop: 'clamp(2px, 0.5vh, 4px)',
              fontWeight: 800,
              fontSize: 'clamp(9px, 1.6vw, 11px)',
              letterSpacing: '1.2px',
              color: '#ffeed8',
              background: 'linear-gradient(180deg, rgba(255, 231, 190, 0.35), rgba(255, 196, 120, 0.22))',
              border: '1px solid rgba(255, 210, 160, 0.65)',
              padding: 'clamp(2px, 0.4vh, 4px) clamp(5px, 1vw, 8px)',
              borderRadius: '999px',
              maxWidth: 'fit-content'
            }}>{displayData.symbol}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'clamp(4px, 0.8vw, 6px)', alignItems: 'center' }}>
          <div style={{
            padding: 'clamp(5px, 1vh, 7px) clamp(8px, 1.8vw, 12px)',
            background: 'linear-gradient(180deg, #ffe49c, #ffc96a)',
            color: '#3a200f',
            fontWeight: 800,
            letterSpacing: '1px',
            fontSize: 'clamp(10px, 1.6vw, 11px)',
            borderRadius: '999px',
            border: '1px solid rgba(140, 85, 35, 0.28)'
          }}>{displayData.category.toUpperCase()}</div>
          {displayData.tokenAddress && (
            <button
              onClick={handleCopyToken}
              style={{
                background: copiedToken ? 'linear-gradient(180deg, #a8ff88, #7fcc5a)' : 'linear-gradient(180deg, #ffe49c, #ffc96a)',
                color: '#3a200f',
                border: '1px solid rgba(140, 85, 35, 0.28)',
                borderRadius: '999px',
                padding: 'clamp(4px, 0.8vh, 6px) clamp(6px, 1.2vw, 8px)',
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(3px, 0.6vw, 4px)',
                cursor: 'pointer',
                fontSize: 'clamp(10px, 1.6vw, 11px)',
                fontWeight: 700,
                transition: 'all 0.2s ease'
              }}
            >
              <Copy size={Math.max(12, Math.min(16, window.innerWidth * 0.035))} />
              {copiedToken ? 'Copied!' : ''}
            </button>
          )}
        </div>
      </div>

      {/* Tax Line - Better spacing */}
      <div style={{
        marginTop: 'clamp(2px, 0.4vh, 4px)',
        marginBottom: 'clamp(3px, 0.6vh, 5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'clamp(4px, 1vw, 8px)',
        flexWrap: 'wrap',
        flexShrink: 0
      }}>
        <div style={{
          fontFamily: '"Sora", "Inter", sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(12px, 2.2vw, 16px)',
          color: '#feea88',
          textShadow: '0 1px 0 rgba(0, 0, 0, 0.18)'
        }}>Tax: {displayData.currentTax}/{displayData.finalTax}</div>
        <div style={{ display: 'flex', gap: 'clamp(2px, 0.6vw, 4px)' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: 'clamp(3px, 0.6vh, 5px) clamp(5px, 1.2vw, 8px)',
            background: '#7e4007',
            border: '1px solid rgba(255, 215, 165, 0.7)',
            color: '#fff0de',
            fontWeight: 900,
            fontSize: 'clamp(9px, 1.4vw, 11px)',
            borderRadius: 'clamp(5px, 1.2vw, 8px)'
          }}>Current Tax: {displayData.currentTax}/{displayData.finalTax}</span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: 'clamp(3px, 0.6vh, 5px) clamp(5px, 1.2vw, 8px)',
            background: '#7e4007',
            border: '1px solid rgba(255, 215, 165, 0.7)',
            color: '#fff0de',
            fontWeight: 900,
            fontSize: 'clamp(9px, 1.4vw, 11px)',
            borderRadius: 'clamp(5px, 1.2vw, 8px)'
          }}>MaxTX: {displayData.maxTx}</span>
        </div>
      </div>

      {/* Description - Fixed spacing without flex expansion */}
      <div style={{
        display: 'block',
        margin: 'clamp(4px, 0.8vh, 6px) 0 clamp(6px, 1.2vh, 8px)',
        color: '#fff1df',
        opacity: 0.96,
        lineHeight: 'clamp(1.4, 1.5, 1.6)',
        fontSize: 'clamp(13px, 2.8vw, 16px)',
        fontWeight: 800,
        textAlign: 'center',
        padding: '0 clamp(4px, 1vw, 8px)'
      }}>
        {displayData.description}
      </div>

      {/* Socials - Better spacing */}
      <div style={{
        display: 'flex',
        gap: 'clamp(6px, 1.2vw, 8px)',
        marginBottom: 'clamp(8px, 1.6vh, 12px)',
        flexShrink: 0
      }}>
        {displayData.telegram && (
          <button style={{
            color: '#fff1dc',
            width: 'clamp(32px, 5.5vw, 36px)',
            height: 'clamp(32px, 5.5vw, 36px)',
            display: 'grid',
            placeItems: 'center',
            borderRadius: 'clamp(8px, 2vw, 12px)',
            background: 'linear-gradient(180deg, rgba(255, 230, 195, 0.22), rgba(255, 196, 120, 0.16))',
            border: '1px solid rgba(255, 215, 165, 0.5)',
            cursor: 'pointer'
          }}
          onClick={() => window.open(displayData.telegram ?? undefined, '_blank')}
          >
            <Send size={Math.max(14, Math.min(18, window.innerWidth * 0.04))} />
          </button>
        )}
        {displayData.twitter && (
          <button style={{
            color: '#fff1dc',
            width: 'clamp(32px, 5.5vw, 36px)',
            height: 'clamp(32px, 5.5vw, 36px)',
            display: 'grid',
            placeItems: 'center',
            borderRadius: 'clamp(8px, 2vw, 12px)',
            background: 'linear-gradient(180deg, rgba(255, 230, 195, 0.22), rgba(255, 196, 120, 0.16))',
            border: '1px solid rgba(255, 215, 165, 0.5)',
            cursor: 'pointer'
          }}
          onClick={() => window.open(displayData.twitter ?? undefined, '_blank')}
          >
            <TwitterIcon />
          </button>
        )}
        {displayData.website && (
          <button style={{
            color: '#fff1dc',
            width: 'clamp(32px, 5.5vw, 36px)',
            height: 'clamp(32px, 5.5vw, 36px)',
            display: 'grid',
            placeItems: 'center',
            borderRadius: 'clamp(8px, 2vw, 12px)',
            background: 'linear-gradient(180deg, rgba(255, 230, 195, 0.22), rgba(255, 196, 120, 0.16))',
            border: '1px solid rgba(255, 215, 165, 0.5)',
            cursor: 'pointer'
          }}
          onClick={() => window.open(displayData.website ?? undefined, '_blank')}
          >
            <Globe size={Math.max(14, Math.min(18, window.innerWidth * 0.04))} />
          </button>
        )}
      </div>

      {/* Score Section */}
      <div style={{
        marginTop: '0',
        background: 'linear-gradient(180deg, #7f4108, #6f3906)',
        border: '1px solid rgba(255, 215, 165, 0.4)',
        borderRadius: 'clamp(14px, 3vw, 20px)',
        padding: 'clamp(12px, 2.5vh, 16px)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        flexShrink: 0
      }}>
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'clamp(6px, 1.2vw, 8px)',
          marginBottom: 'clamp(10px, 2vh, 14px)'
        }}>
          <div style={{
            background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
            border: '1px solid rgba(255, 210, 160, 0.4)',
            borderRadius: 'clamp(8px, 2vw, 14px)',
            padding: 'clamp(8px, 1.8vh, 10px) clamp(8px, 2vw, 12px)',
            textAlign: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              fontWeight: 800,
              fontSize: 'clamp(10px, 1.8vw, 12px)',
              letterSpacing: '1px',
              color: '#ffe0b6',
              marginBottom: 'clamp(3px, 0.8vh, 6px)'
            }}>MCAP</div>
            <div style={{
              fontFamily: '"Sora", "Inter", sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(14px, 2.8vw, 18px)',
              lineHeight: 1.1,
              color: '#fff6e6',
              textShadow: '0 1px 0 rgba(0, 0, 0, 0.18)'
            }}>{displayData.mcap}</div>
          </div>
          <div style={{
            background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
            border: '1px solid rgba(255, 210, 160, 0.4)',
            borderRadius: 'clamp(8px, 2vw, 14px)',
            padding: 'clamp(8px, 1.8vh, 10px) clamp(8px, 2vw, 12px)',
            textAlign: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              fontWeight: 800,
              fontSize: 'clamp(10px, 1.8vw, 12px)',
              letterSpacing: '1px',
              color: '#ffe0b6',
              marginBottom: 'clamp(3px, 0.8vh, 6px)'
            }}>VOLUME</div>
            <div style={{
              fontFamily: '"Sora", "Inter", sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(14px, 2.8vw, 18px)',
              lineHeight: 1.1,
              color: '#fff6e6',
              textShadow: '0 1px 0 rgba(0, 0, 0, 0.18)'
            }}>{displayData.volume}</div>
          </div>
          <div style={{
            background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
            border: '1px solid rgba(255, 210, 160, 0.4)',
            borderRadius: 'clamp(8px, 2vw, 14px)',
            padding: 'clamp(8px, 1.8vh, 10px) clamp(8px, 2vw, 12px)',
            textAlign: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              fontWeight: 800,
              fontSize: 'clamp(10px, 1.8vw, 12px)',
              letterSpacing: '1px',
              color: '#ffe0b6',
              marginBottom: 'clamp(3px, 0.8vh, 6px)'
            }}>LP</div>
            <div style={{
              fontFamily: '"Sora", "Inter", sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(14px, 2.8vw, 18px)',
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
            height: 'clamp(45px, 10vh, 64px)',
            borderRadius: 'clamp(20px, 5vw, 28px)',
            background: 'radial-gradient(100% 120% at 50% 120%, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.35) 40%, rgba(0, 0, 0, 0.35) 70%, rgba(255, 255, 255, 0.08) 100%), linear-gradient(180deg, #9a5a2c, #6a3a1c)',
            boxShadow: 'inset 0 8px 18px rgba(0, 0, 0, 0.42), inset 0 2px 0 rgba(255, 255, 255, 0.22), 0 10px 28px rgba(0, 0, 0, 0.35)',
            padding: 'clamp(4px, 1vh, 6px)',
            overflow: 'visible'
          }}
        >
          <div 
            ref={fillRef}
            style={{
              position: 'relative',
              height: 'clamp(37px, 8vh, 52px)',
              width: '0%',
              borderRadius: 'clamp(16px, 4.5vw, 22px)',
              background: 'linear-gradient(180deg, #ffedae, #ffd96f 55%, #ffc14d 100%)',
              boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.75), inset 0 -2px 10px rgba(165, 82, 22, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.28), 0 12px 32px rgba(255, 180, 70, 0.52), 0 0 24px 2px rgba(255, 180, 70, 0.58)',
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
                fontSize: 'clamp(14px, 2.8vw, 18px)',
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
