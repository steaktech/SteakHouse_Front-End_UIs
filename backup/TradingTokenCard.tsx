import React, { useEffect, useRef } from 'react';
import { Globe, Send } from 'lucide-react';
import { TokenCardProps } from '@/app/components/TradingDashboard/types';

const TwitterIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 1200 1227" fill="currentColor">
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6902H306.615L611.412 515.685L658.88 583.579L1055.08 1150.31H892.476L569.165 687.854V687.828Z"/>
  </svg>
);

export const TradingTokenCard: React.FC<TokenCardProps> = ({ 
  imageUrl, 
  name, 
  symbol, 
  tag, 
  description, 
  mcap, 
  liquidity, 
  volume, 
  progress 
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

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
      setProgress(progress);
    }, 100);
  }, [progress]);

  return (
    <div 
      style={{
        width: '100%',
        maxWidth: '420px',
        height: 'auto',
        minHeight: '450px',
        position: 'relative',
        borderRadius: '26px',
        background: 'linear-gradient(180deg, #572501, #572501 10%, #572501 58%, #7d3802 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        padding: '22px 22px 18px',
        border: '1px solid rgba(255, 215, 165, 0.4)',
        overflow: 'hidden',
        color: '#fff7ea',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>
      
      {/* Banner */}
      <div style={{
        position: 'relative',
        aspectRatio: '3 / 1',
        margin: '-22px -22px 12px -22px',
        borderRadius: '26px 26px 0 0',
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
        marginTop: '2px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(145deg, #915428, #4a2815)',
            border: '1px solid rgba(255, 215, 165, 0.65)',
            overflow: 'hidden'
          }}>
            <img 
              src={imageUrl} 
              alt={name} 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <h1 style={{
              color: '#feea88',
              fontFamily: '"Sora", "Inter", sans-serif',
              fontWeight: 800,
              fontSize: '22px',
              lineHeight: 1,
              margin: 0
            }}>{name}</h1>
            <div style={{
              marginTop: '6px',
              fontWeight: 800,
              fontSize: '12px',
              letterSpacing: '1.2px',
              color: '#ffeed8',
              background: 'linear-gradient(180deg, rgba(255, 231, 190, 0.35), rgba(255, 196, 120, 0.22))',
              border: '1px solid rgba(255, 210, 160, 0.65)',
              padding: '5px 10px',
              borderRadius: '999px',
              maxWidth: 'fit-content'
            }}>{symbol}</div>
          </div>
        </div>
        <div style={{
          padding: '8px 14px',
          background: 'linear-gradient(180deg, #ffe49c, #ffc96a)',
          color: '#3a200f',
          fontWeight: 800,
          letterSpacing: '1px',
          fontSize: '12px',
          borderRadius: '999px',
          border: '1px solid rgba(140, 85, 35, 0.28)'
        }}>{tag}</div>
      </div>

      {/* Tax Line */}
      <div style={{
        marginTop: '8px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          fontFamily: '"Sora", "Inter", sans-serif',
          fontWeight: 800,
          fontSize: '18px',
          color: '#feea88',
          textShadow: '0 1px 0 rgba(0, 0, 0, 0.18)'
        }}>Tax: 3/3</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px',
            background: '#7e4007',
            border: '1px solid rgba(255, 215, 165, 0.7)',
            color: '#fff0de',
            fontWeight: 900,
            fontSize: '12px',
            borderRadius: '10px'
          }}>Current Tax: 3/3</span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px',
            background: '#7e4007',
            border: '1px solid rgba(255, 215, 165, 0.7)',
            color: '#fff0de',
            fontWeight: 900,
            fontSize: '12px',
            borderRadius: '10px'
          }}>MaxTX: 2,1%</span>
        </div>
      </div>

      {/* Description in rounded container */}
      <div style={{
        margin: '12px 0 18px',
        padding: '24px 20px',
        borderRadius: '20px',
        border: '1px solid rgba(100, 60, 30, 0.6)',
        background: 'rgba(60, 35, 20, 0.4)',
        color: '#fff1df',
        fontSize: '18px',
        fontWeight: 800,
        lineHeight: 1.4,
        textAlign: 'center'
      }}>
        {description}
      </div>

      {/* Social Buttons - positioned to align with stat cards below */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginBottom: '18px',
        padding: '0 15px 0 9px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button style={{
            color: '#fff1dc',
            width: '50px',
            height: '50px',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '12px',
            background: 'linear-gradient(180deg, rgba(255, 230, 195, 0.22), rgba(255, 196, 120, 0.16))',
            border: '1px solid rgba(255, 215, 165, 0.5)',
            cursor: 'pointer'
          }}>
            <Send size={22} />
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button style={{
            color: '#fff1dc',
            width: '50px',
            height: '50px',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '12px',
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
            width: '50px',
            height: '50px',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '12px',
            background: 'linear-gradient(180deg, rgba(255, 230, 195, 0.22), rgba(255, 196, 120, 0.16))',
            border: '1px solid rgba(255, 215, 165, 0.5)',
            cursor: 'pointer'
          }}>
            <Globe size={22} />
          </button>
        </div>
      </div>

      {/* Score Section */}
      <div style={{
        marginTop: '0',
        marginBottom: '0',
        background: 'linear-gradient(180deg, #7f4108, #6f3906)',
        border: '1px solid rgba(255, 215, 165, 0.4)',
        borderRadius: '20px',
        padding: '12px 12px 8px 12px',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)'
      }}>
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
            border: '1px solid rgba(255, 210, 160, 0.4)',
            borderRadius: '14px',
            padding: '10px 12px',
            textAlign: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              fontWeight: 800,
              fontSize: '12px',
              letterSpacing: '1px',
              color: '#ffe0b6',
              marginBottom: '6px'
            }}>MCAP</div>
            <div style={{
              fontFamily: '"Sora", "Inter", sans-serif',
              fontWeight: 800,
              fontSize: '18px',
              lineHeight: 1.1,
              color: '#fff6e6',
              textShadow: '0 1px 0 rgba(0, 0, 0, 0.18)'
            }}>{mcap}</div>
          </div>
          <div style={{
            background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
            border: '1px solid rgba(255, 210, 160, 0.4)',
            borderRadius: '14px',
            padding: '10px 12px',
            textAlign: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              fontWeight: 800,
              fontSize: '12px',
              letterSpacing: '1px',
              color: '#ffe0b6',
              marginBottom: '6px'
            }}>VOLUME</div>
            <div style={{
              fontFamily: '"Sora", "Inter", sans-serif',
              fontWeight: 800,
              fontSize: '18px',
              lineHeight: 1.1,
              color: '#fff6e6',
              textShadow: '0 1px 0 rgba(0, 0, 0, 0.18)'
            }}>{volume}</div>
          </div>
          <div style={{
            background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
            border: '1px solid rgba(255, 210, 160, 0.4)',
            borderRadius: '14px',
            padding: '10px 12px',
            textAlign: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              fontWeight: 800,
              fontSize: '12px',
              letterSpacing: '1px',
              color: '#ffe0b6',
              marginBottom: '6px'
            }}>LP</div>
            <div style={{
              fontFamily: '"Sora", "Inter", sans-serif',
              fontWeight: 800,
              fontSize: '18px',
              lineHeight: 1.1,
              color: '#fff6e6',
              textShadow: '0 1px 0 rgba(0, 0, 0, 0.18)'
            }}>{liquidity}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          ref={trackRef}
          style={{
            position: 'relative',
            height: '64px',
            borderRadius: '28px',
            background: 'radial-gradient(100% 120% at 50% 120%, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.35) 40%, rgba(0, 0, 0, 0.35) 70%, rgba(255, 255, 255, 0.08) 100%), linear-gradient(180deg, #9a5a2c, #6a3a1c)',
            boxShadow: 'inset 0 8px 18px rgba(0, 0, 0, 0.42), inset 0 2px 0 rgba(255, 255, 255, 0.22), 0 10px 28px rgba(0, 0, 0, 0.35)',
            padding: '6px',
            overflow: 'visible'
          }}
        >
          <div 
            ref={fillRef}
            style={{
              position: 'relative',
              height: '52px',
              width: '0%',
              borderRadius: '22px',
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
                fontSize: '18px',
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
