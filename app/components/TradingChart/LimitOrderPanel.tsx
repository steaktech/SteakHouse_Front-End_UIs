"use client";

import React, { useState, useEffect } from 'react';
import { Target, Clock, AlertCircle, DollarSign } from 'lucide-react';
import { OrderSide, OrderType, OrderTimeInForce, LimitOrderPanelProps, OrderFormData, PriceLevel } from './types';

export const LimitOrderPanel: React.FC<LimitOrderPanelProps> = ({
  currentPrice = 21.50,
  onOrderSubmit,
  maxBalance = 10000,
  minOrderSize = 0.01,
  tickSize = 0.01,
  initialSide = 'buy'
}) => {
  const [orderSide, setOrderSide] = useState<OrderSide>(initialSide);
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [timeInForce, setTimeInForce] = useState<OrderTimeInForce>('GTC');
  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate derived values
  const numericPrice = parseFloat(price) || 0;
  const numericAmount = parseFloat(amount) || 0;
  const estimatedTotal = numericPrice * numericAmount;
  const priceDeviation = currentPrice ? ((numericPrice - currentPrice) / currentPrice * 100) : 0;

  // Quick price levels
  const priceLevels: PriceLevel[] = [
    { label: 'Market -5%', price: currentPrice * 0.95, deviation: -5, type: 'custom' },
    { label: 'Market -2%', price: currentPrice * 0.98, deviation: -2, type: 'custom' },
    { label: 'Market -1%', price: currentPrice * 0.99, deviation: -1, type: 'custom' },
    { label: 'Market', price: currentPrice, deviation: 0, type: 'market' },
    { label: 'Market +1%', price: currentPrice * 1.01, deviation: 1, type: 'custom' },
    { label: 'Market +2%', price: currentPrice * 1.02, deviation: 2, type: 'custom' },
    { label: 'Market +5%', price: currentPrice * 1.05, deviation: 5, type: 'custom' },
  ];

  // Quick amount presets
  const getQuickAmounts = () => {
    if (orderSide === 'buy') {
      const amounts = [];
      const baseAmounts = [100, 500, 1000, 2500];
      for (const amt of baseAmounts) {
        if (numericPrice > 0) {
          const dollarAmount = amt;
          const tokenAmount = dollarAmount / numericPrice;
          amounts.push({ label: `$${amt}`, value: tokenAmount.toString() });
        }
      }
      amounts.push({ label: 'Max', value: (maxBalance / (numericPrice || 1)).toString() });
      return amounts;
    } else {
      return [
        { label: '25%', value: '25' },
        { label: '50%', value: '50' },
        { label: '75%', value: '75' },
        { label: '100%', value: '100' }
      ];
    }
  };

  const handlePriceSelect = (priceLevel: PriceLevel) => {
    setPrice(priceLevel.price.toFixed(2));
  };

  const handleAmountSelect = (value: string, isPercentage: boolean = false) => {
    if (orderSide === 'sell' && isPercentage) {
      // For sell orders, convert percentage to actual amount based on holdings
      const percentage = parseFloat(value);
      const holdings = 1000; // Mock holdings - in real app, get from state
      setAmount(((holdings * percentage) / 100).toFixed(2));
    } else {
      setAmount(value);
    }
  };

  const handleSubmit = async () => {
    if (!onOrderSubmit || !price || !amount) return;

    setIsSubmitting(true);
    try {
      const orderData: OrderFormData = {
        side: orderSide,
        type: orderType,
        price,
        amount,
        timeInForce,
        notes: notes.trim() || undefined
      };

      const result = await onOrderSubmit(orderData);
      
      if (result.success) {
        // Reset form on successful submission
        setPrice('');
        setAmount('');
        setNotes('');
      }
    } catch (error) {
      console.error('Order submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidOrder = price && amount && parseFloat(price) > 0 && parseFloat(amount) >= minOrderSize;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      borderRadius: 'clamp(18px, 2.5vw, 26px)',
      background: 'linear-gradient(180deg, #572501, #572501 10%, #572501 58%, #7d3802 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      padding: 'clamp(5px, 0.9vh, 8px)',
      paddingBottom: 'clamp(10px, 1.8vh, 14px)',
      border: '1px solid rgba(255, 215, 165, 0.4)',
      overflow: 'auto',
      color: '#fff7ea',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginBottom: 'clamp(3px, 0.6vh, 5px)'
      }}>
        <Target size={16} style={{ color: '#feea88' }} />
        <h3 style={{
          color: '#feea88',
          fontFamily: '"Sora", "Inter", sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          margin: 0,
          textShadow: '0 1px 0 rgba(0, 0, 0, 0.18)'
        }}>
          Limit Orders
        </h3>
        {currentPrice && (
          <div style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: 'clamp(11px, 1.8vw, 13px)',
            color: '#feea88',
            fontWeight: 600
          }}>
            <DollarSign size={12} />
            ${currentPrice.toFixed(2)}
          </div>
        )}
      </div>

      {/* Order Side Tabs */}
      <div style={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: 'clamp(32px, 4.5vh, 38px)',
        borderRadius: 'clamp(12px, 2.5vw, 16px)',
        background: 'linear-gradient(180deg, #7f4108, #6f3906)',
        border: '1px solid rgba(255, 215, 165, 0.4)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        marginBottom: 'clamp(3px, 0.6vh, 5px)',
        padding: '2px'
      }}>
        {/* Sliding Background */}
        <div style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          height: 'calc(100% - 4px)',
          width: 'calc(50% - 2px)',
          borderRadius: 'clamp(9px, 2vw, 13px)',
          transition: 'all 300ms ease-in-out',
          transform: orderSide === 'buy' ? 'translateX(0)' : 'translateX(calc(100% + 2px))',
          background: orderSide === 'buy'
            ? 'linear-gradient(180deg, #4ade80, #22c55e)'
            : 'linear-gradient(180deg, #f87171, #ef4444)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)'
        }} />
        
        <button
          onClick={() => setOrderSide('buy')}
          style={{
            position: 'relative',
            zIndex: 10,
            flex: 1,
            padding: 'clamp(6px, 1.2vh, 8px)',
            textAlign: 'center',
            fontSize: 'clamp(12px, 2.2vw, 14px)',
            fontWeight: 800,
            color: orderSide === 'buy' ? '#1f2937' : '#feea88',
            background: 'transparent',
            border: 'none',
            borderRadius: 'clamp(9px, 2vw, 13px)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            marginRight: '1px'
          }}
        >
          BUY LIMIT
        </button>
        <button
          onClick={() => setOrderSide('sell')}
          style={{
            position: 'relative',
            zIndex: 10,
            flex: 1,
            padding: 'clamp(6px, 1.2vh, 8px)',
            textAlign: 'center',
            fontSize: 'clamp(12px, 2.2vw, 14px)',
            fontWeight: 800,
            color: orderSide === 'sell' ? '#1f2937' : '#feea88',
            background: 'transparent',
            border: 'none',
            borderRadius: 'clamp(9px, 2vw, 13px)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            marginLeft: '1px'
          }}
        >
          SELL LIMIT
        </button>
      </div>

      {/* Price Input */}
      <div style={{ marginBottom: 'clamp(4px, 0.8vh, 6px)' }}>
        <label style={{
          display: 'block',
          fontSize: 'clamp(11px, 1.8vw, 13px)',
          fontWeight: 700,
          color: '#feea88',
          marginBottom: '1px',
          textShadow: '0 1px 0 rgba(0, 0, 0, 0.3)'
        }}>
          Price ($)
        </label>
        <div style={{
          position: 'relative',
          background: 'linear-gradient(180deg, #7f4108, #6f3906)',
          border: '1px solid rgba(255, 215, 165, 0.4)',
          borderRadius: 'clamp(10px, 2.5vw, 14px)',
          padding: '3px',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)'
        }}>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step={tickSize}
            min={tickSize}
            placeholder="0.00"
            style={{
              width: '100%',
              background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2))',
              color: '#feea88',
              fontSize: 'clamp(13px, 2.6vw, 15px)',
              fontWeight: 700,
              padding: 'clamp(6px, 1.1vh, 8px) clamp(9px, 2vw, 12px)',
              borderRadius: 'clamp(7px, 1.8vw, 11px)',
              border: `2px solid ${orderSide === 'buy' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
              outline: 'none',
              textAlign: 'left',
              fontFamily: '"Sora", "Inter", sans-serif',
              transition: 'all 200ms ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.border = `2px solid ${orderSide === 'buy' ? '#4ade80' : '#f87171'}`;
              e.target.style.boxShadow = `0 0 0 2px ${orderSide === 'buy' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`;
            }}
            onBlur={(e) => {
              e.target.style.border = `2px solid ${orderSide === 'buy' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`;
              e.target.style.boxShadow = 'none';
            }}
          />
          {priceDeviation !== 0 && (
            <div style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 'clamp(9px, 1.5vw, 11px)',
              fontWeight: 700,
              color: priceDeviation > 0 ? '#4ade80' : '#f87171',
              textShadow: '0 1px 0 rgba(0, 0, 0, 0.4)'
            }}>
              {priceDeviation > 0 ? '+' : ''}{priceDeviation.toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* Quick Price Levels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'clamp(2px, 0.4vw, 3px)',
        marginBottom: 'clamp(4px, 0.8vh, 6px)'
      }}>
        {priceLevels.slice(orderSide === 'buy' ? 0 : 3, orderSide === 'buy' ? 4 : 7).map((level) => (
          <button
            key={level.label}
            onClick={() => handlePriceSelect(level)}
            style={{
              background: level.type === 'market' 
                ? 'linear-gradient(180deg, #ffd700, #daa20b 60%, #b8860b)'
                : 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
              border: '1px solid rgba(255, 210, 160, 0.4)',
              borderRadius: 'clamp(8px, 1.8vw, 10px)',
              padding: 'clamp(5px, 1vh, 7px) clamp(3px, 0.5vw, 4px)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              color: level.type === 'market' ? '#1f2937' : '#feea88',
              fontSize: 'clamp(9px, 1.6vw, 11px)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 200ms ease',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}
          >
            {level.label}
          </button>
        ))}
      </div>

      {/* Amount Input */}
      <div style={{ marginBottom: 'clamp(4px, 0.8vh, 6px)' }}>
        <label style={{
          display: 'block',
          fontSize: 'clamp(11px, 1.8vw, 13px)',
          fontWeight: 700,
          color: '#feea88',
          marginBottom: '1px',
          textShadow: '0 1px 0 rgba(0, 0, 0, 0.3)'
        }}>
          Amount {orderSide === 'sell' ? '(Tokens)' : '(Tokens)'}
        </label>
        <div style={{
          position: 'relative',
          background: 'linear-gradient(180deg, #7f4108, #6f3906)',
          border: '1px solid rgba(255, 215, 165, 0.4)',
          borderRadius: 'clamp(10px, 2.5vw, 14px)',
          padding: '3px',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)'
        }}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step={minOrderSize}
            min={minOrderSize}
            placeholder="0"
            style={{
              width: '100%',
              background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2))',
              color: '#feea88',
              fontSize: 'clamp(13px, 2.6vw, 15px)',
              fontWeight: 700,
              padding: 'clamp(6px, 1.1vh, 8px) clamp(9px, 2vw, 12px)',
              borderRadius: 'clamp(7px, 1.8vw, 11px)',
              border: `2px solid ${orderSide === 'buy' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
              outline: 'none',
              textAlign: 'left',
              fontFamily: '"Sora", "Inter", sans-serif',
              transition: 'all 200ms ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.border = `2px solid ${orderSide === 'buy' ? '#4ade80' : '#f87171'}`;
              e.target.style.boxShadow = `0 0 0 2px ${orderSide === 'buy' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`;
            }}
            onBlur={(e) => {
              e.target.style.border = `2px solid ${orderSide === 'buy' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: orderSide === 'buy' ? 'repeat(3, 1fr) auto' : 'repeat(4, 1fr)',
        gap: 'clamp(2px, 0.4vw, 3px)',
        marginBottom: 'clamp(4px, 0.8vh, 6px)'
      }}>
        {getQuickAmounts().map((preset) => (
          <button
            key={preset.label}
            onClick={() => handleAmountSelect(preset.value, orderSide === 'sell')}
            style={{
              background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
              border: '1px solid rgba(255, 210, 160, 0.4)',
              borderRadius: 'clamp(8px, 1.8vw, 10px)',
              padding: 'clamp(5px, 1vh, 7px) clamp(3px, 0.5vw, 4px)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              color: '#feea88',
              fontSize: 'clamp(9px, 1.6vw, 11px)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 200ms ease',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Order Summary */}
      {estimatedTotal > 0 && (
        <div style={{
          background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.4), rgba(87, 37, 1, 0.3) 50%, rgba(87, 37, 1, 0.35) 100%)',
          border: '1px solid rgba(255, 215, 165, 0.25)',
          borderRadius: 'clamp(8px, 1.8vw, 12px)',
          padding: 'clamp(5px, 0.9vh, 8px)',
          marginBottom: 'clamp(4px, 0.8vh, 6px)',
          fontSize: 'clamp(10px, 1.6vw, 12px)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#feea88', fontWeight: 600 }}>
              Total: ${estimatedTotal.toFixed(2)}
            </span>
            {priceDeviation !== 0 && (
              <span style={{
                color: priceDeviation > 0 ? '#4ade80' : '#f87171',
                fontWeight: 700,
                fontSize: 'clamp(10px, 1.6vw, 12px)'
              }}>
                {priceDeviation > 0 ? 'Above' : 'Below'} Market
              </span>
            )}
          </div>
        </div>
      )}

      {/* Time in Force (Advanced) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginBottom: 'clamp(4px, 0.8vh, 6px)'
      }}>
        <Clock size={14} style={{ color: '#feea88' }} />
        <select
          value={timeInForce}
          onChange={(e) => setTimeInForce(e.target.value as OrderTimeInForce)}
          style={{
            background: 'linear-gradient(180deg, #3a1c08, #2d1506)',
            border: '1px solid rgba(255, 215, 165, 0.4)',
            borderRadius: 'clamp(6px, 1.5vw, 8px)',
            padding: 'clamp(3px, 0.8vh, 5px) clamp(7px, 1.4vw, 9px)',
            fontSize: 'clamp(10px, 1.6vw, 11px)',
            fontWeight: 600,
            color: '#feea88',
            outline: 'none',
            cursor: 'pointer',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          }}
        >
          <option value="GTC">Good Till Cancelled</option>
          <option value="IOC">Immediate or Cancel</option>
          <option value="FOK">Fill or Kill</option>
          <option value="DAY">Day Order</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isValidOrder || isSubmitting}
        style={{
          width: '100%',
          background: isValidOrder && !isSubmitting
            ? (orderSide === 'buy'
              ? 'linear-gradient(180deg, #4ade80, #22c55e)'
              : 'linear-gradient(180deg, #f87171, #ef4444)')
            : 'linear-gradient(180deg, #6b7280, #4b5563)',
          color: isValidOrder && !isSubmitting ? '#1f2937' : '#9ca3af',
          fontWeight: 800,
          fontSize: 'clamp(11px, 2vw, 13px)',
          padding: 'clamp(7px, 1.3vh, 9px)',
          borderRadius: 'clamp(10px, 2.5vw, 14px)',
          border: 'none',
          cursor: isValidOrder && !isSubmitting ? 'pointer' : 'not-allowed',
          transition: 'all 200ms ease',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)',
          textShadow: '0 1px 0 rgba(255, 255, 255, 0.3)',
          marginTop: 'auto',
          flexShrink: 0,
          letterSpacing: '0.5px',
          minHeight: 'clamp(30px, 4vh, 36px)',
          opacity: isValidOrder && !isSubmitting ? 1 : 0.6
        }}
      >
        {isSubmitting ? 'PLACING ORDER...' : `PLACE ${orderSide.toUpperCase()} LIMIT ORDER`}
      </button>
    </div>
  );
};