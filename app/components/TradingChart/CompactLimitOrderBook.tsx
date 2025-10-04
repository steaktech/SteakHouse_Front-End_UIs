"use client";

import React, { useState } from 'react';
import { Target, TrendingUp, TrendingDown, X, Edit3, Clock } from 'lucide-react';
import { LimitOrder, OrderStatus, OrderSide, LimitOrderBookProps } from './types';

interface CompactLimitOrderBookProps extends LimitOrderBookProps {
  showToggle?: boolean;
  showLimitOrders?: boolean;
  onToggleChange?: (showLimitOrders: boolean) => void;
  isMobile?: boolean;
}

export const CompactLimitOrderBook: React.FC<CompactLimitOrderBookProps> = ({
  orders = [],
  onCancelOrder,
  onModifyOrder,
  loading = false,
  error,
  showToggle = false,
  showLimitOrders = false,
  onToggleChange,
  isMobile = false
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | OrderStatus>('all');
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [newAmount, setNewAmount] = useState('');

  // Filter orders
  const getFilteredOrders = () => {
    let filtered = orders;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'filled':
        return '#4ade80';
      case 'pending':
        return '#60a5fa';
      case 'cancelled':
        return '#f87171';
      default:
        return '#feea88';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'filled':
        return '✓';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '✕';
      default:
        return '•';
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (onCancelOrder) {
      await onCancelOrder(orderId);
    }
  };

  const handleModifyOrder = async (orderId: string) => {
    if (onModifyOrder && newPrice && newAmount) {
      const success = await onModifyOrder(orderId, parseFloat(newPrice), parseFloat(newAmount));
      if (success) {
        setEditingOrder(null);
        setNewPrice('');
        setNewAmount('');
      }
    }
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      color: '#fff7ea'
    }}>
      {/* Header with optional toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'clamp(8px, 1.5vh, 12px)'
      }}>
        <h3 style={{
          color: '#feea88',
          fontFamily: '"Sora", "Inter", sans-serif',
          fontWeight: 800,
          fontSize: isMobile ? '14px' : 'clamp(14px, 2.5vw, 16px)',
          lineHeight: 1,
          margin: 0,
          textShadow: '0 1px 0 rgba(0, 0, 0, 0.18)'
        }}>
          Limit Orders
        </h3>
        
        {/* Toggle Switch */}
        {showToggle && onToggleChange && (
          <div style={{
            position: 'relative',
            display: 'flex',
            background: 'linear-gradient(180deg, #7f4108, #6f3906)',
            border: '1px solid rgba(255, 215, 165, 0.4)',
            borderRadius: '20px',
            padding: '3px',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            flexShrink: 0,
            width: isMobile ? '130px' : '150px',
            height: '32px'
          }}>
            <div style={{
              position: 'absolute',
              top: '3px',
              left: showLimitOrders ? 'calc(50% + 1.5px)' : '3px',
              height: 'calc(100% - 6px)',
              width: 'calc(50% - 4.5px)',
              borderRadius: '16px',
              transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              background: showLimitOrders 
                ? 'linear-gradient(180deg, #ffd700, #daa20b)'
                : 'linear-gradient(180deg, #4ade80, #22c55e)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }} />
            <button
              onClick={() => onToggleChange(false)}
              style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '9px' : '10px',
                fontWeight: 700,
                color: !showLimitOrders ? '#1f2937' : '#feea88',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                whiteSpace: 'nowrap',
                width: '50%',
                height: '100%',
                letterSpacing: '0.5px'
              }}
            >
              TXN
            </button>
            <button
              onClick={() => onToggleChange(true)}
              style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '9px' : '10px',
                fontWeight: 700,
                color: showLimitOrders ? '#1f2937' : '#feea88',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                whiteSpace: 'nowrap',
                width: '50%',
                height: '100%',
                letterSpacing: '0.5px'
              }}
            >
              ORDERS
            </button>
          </div>
        )}
      </div>
      
      {/* Filter Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: 'clamp(12px, 2vh, 16px)',
        flexWrap: 'wrap',
        padding: 'clamp(10px, 2vh, 14px) clamp(14px, 3vh, 18px)',
        background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.4), rgba(87, 37, 1, 0.3) 50%, rgba(87, 37, 1, 0.35) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))',
        border: '1px solid rgba(255, 215, 165, 0.25)',
        borderRadius: 'clamp(10px, 2vw, 14px)',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
      }}>
        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ 
            fontSize: 'clamp(11px, 2vw, 13px)', 
            color: '#feea88', 
            fontWeight: 800,
            textShadow: '0 1px 0 rgba(0, 0, 0, 0.4)',
            letterSpacing: '0.3px'
          }}>STATUS</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={{
              background: 'linear-gradient(180deg, #3a1c08, #2d1506)',
              border: '1px solid rgba(255, 215, 165, 0.4)',
              borderRadius: 'clamp(6px, 1.5vw, 8px)',
              padding: 'clamp(5px, 1.2vh, 7px) clamp(8px, 2vw, 12px)',
              fontSize: 'clamp(10px, 1.8vw, 12px)',
              fontWeight: 700,
              color: '#feea88',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '80px',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 4px rgba(0, 0, 0, 0.2)',
              textShadow: '0 1px 0 rgba(0, 0, 0, 0.3)'
            }}
          >
            <option value="all" style={{ background: '#2d1506', color: '#feea88' }}>All</option>
            <option value="pending" style={{ background: '#2d1506', color: '#feea88' }}>Active</option>
            <option value="filled" style={{ background: '#2d1506', color: '#feea88' }}>Filled</option>
            <option value="cancelled" style={{ background: '#2d1506', color: '#feea88' }}>Cancelled</option>
          </select>
        </div>
        
        {/* Order Count */}
        <span style={{ 
          marginLeft: 'auto',
          fontSize: 'clamp(11px, 2vw, 13px)', 
          color: '#feea88', 
          fontWeight: 800,
          textShadow: '0 1px 0 rgba(0, 0, 0, 0.4)',
          letterSpacing: '0.3px'
        }}>
          {filteredOrders.length} ORDERS
        </span>
      </div>

      {/* Order List Container matching TradeHistory */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(180deg, #3a1c08, #2d1506)',
        border: '1px solid rgba(255, 215, 165, 0.4)',
        borderRadius: 'clamp(14px, 3vw, 20px)',
        padding: 'clamp(12px, 2.5vh, 16px)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {loading && (
            <div style={{
              textAlign: 'center',
              color: '#feea88',
              padding: '10px',
              fontSize: '11px'
            }}>
              Loading...
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#feea88',
              padding: '20px 10px',
              fontSize: '11px',
              opacity: 0.7
            }}>
              No active orders
            </div>
          )}

          {!loading && filteredOrders.map((order) => (
            <div
              key={order.id}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(87, 37, 1, 0.3)',
                border: '1px solid rgba(255, 215, 165, 0.2)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: '32px'
              }}
            >
              {editingOrder === order.id ? (
                // Edit Mode - Matching transaction size
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="Price"
                    style={{
                      width: '80px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(255, 215, 165, 0.3)',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      color: '#feea88',
                      fontSize: '11px',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="Amount"
                    style={{
                      width: '80px',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(255, 215, 165, 0.3)',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      color: '#feea88',
                      fontSize: '11px',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => handleModifyOrder(order.id)}
                    style={{
                      background: '#4ade80',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      color: 'black',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setEditingOrder(null)}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255, 215, 165, 0.3)',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      color: '#feea88',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                // Display Mode - Matching transaction layout
                <>
                  {/* Left side - Order info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    {/* Order Icon */}
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      border: '1px solid',
                      background: order.side === 'buy' 
                        ? 'linear-gradient(to right, #4ade80, #22c55e)' 
                        : 'linear-gradient(to right, #ef4444, #dc2626)',
                      color: order.side === 'buy' ? 'black' : 'white',
                      borderColor: order.side === 'buy' ? '#86efac' : '#fca5a5',
                      flexShrink: 0
                    }}>
                      {order.side === 'buy' ? '↗' : '↘'}
                    </div>
                    
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: order.side === 'buy' ? '#4ade80' : '#f87171',
                      textTransform: 'uppercase',
                      minWidth: '30px',
                      flexShrink: 0
                    }}>
                      {order.side.toUpperCase()}
                    </span>
                    
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#feea88', flexShrink: 0 }}>                      
                      {order.amount > 999 ? `${(order.amount/1000).toFixed(1)}K` : order.amount} ASTER
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#feea88', flexShrink: 0 }}>                      
                      (${order.price.toFixed(2)})
                    </span>
                    
                    <span style={{ color: '#ffe0b6', opacity: 0.9, fontSize: '11px', marginLeft: '8px' }}>Status:</span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: getStatusColor(order.status),
                      textTransform: 'capitalize',
                      flexShrink: 0
                    }}>
                      {order.status} {getStatusIcon(order.status)}
                    </span>
                  </div>
                  
                  {/* Right side - Actions and time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#feea88' }}>
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {/* Actions - Only for active orders */}
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setEditingOrder(order.id);
                            setNewPrice(order.price.toString());
                            setNewAmount(order.remaining.toString());
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            opacity: 1,
                            transition: 'opacity 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                          title="Edit order"
                        >
                          <Edit3 size={12} color="#feea88" />
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            opacity: 1,
                            transition: 'opacity 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                          title="Cancel order"
                        >
                          <X size={12} color="#f87171" />
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};