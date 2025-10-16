"use client";

import React, { useState } from 'react';
import { Target, Clock, AlertCircle, TrendingUp, TrendingDown, Edit3, X } from 'lucide-react';
import { LimitOrder, OrderStatus, OrderSide, LimitOrderBookProps } from './types';
import { formatAmount } from './utils';

// Mock data for demonstration
const mockOrders: LimitOrder[] = [
  {
    id: '1',
    type: 'limit',
    side: 'buy',
    price: 21.20,
    amount: 1500,
    filled: 750,
    remaining: 750,
    status: 'pending',
    timeInForce: 'GTC',
    createdAt: '2024-01-15 14:23:45',
    updatedAt: '2024-01-15 14:35:12',
    marketPrice: 21.50,
    priceDeviation: -1.4,
    estimatedTotal: 31800,
    symbol: 'SPACE'
  },
  {
    id: '2',
    type: 'limit',
    side: 'sell',
    price: 22.10,
    amount: 2000,
    filled: 0,
    remaining: 2000,
    status: 'pending',
    timeInForce: 'GTC',
    createdAt: '2024-01-15 14:18:20',
    updatedAt: '2024-01-15 14:18:20',
    marketPrice: 21.50,
    priceDeviation: 2.8,
    estimatedTotal: 44200,
    symbol: 'SPACE'
  },
  {
    id: '3',
    type: 'limit',
    side: 'buy',
    price: 20.95,
    amount: 3000,
    filled: 3000,
    remaining: 0,
    status: 'filled',
    timeInForce: 'IOC',
    createdAt: '2024-01-15 14:10:15',
    updatedAt: '2024-01-15 14:12:33',
    marketPrice: 21.50,
    priceDeviation: -2.6,
    estimatedTotal: 62850,
    symbol: 'SPACE'
  },
  {
    id: '4',
    type: 'limit',
    side: 'sell',
    price: 22.85,
    amount: 1000,
    filled: 0,
    remaining: 1000,
    status: 'cancelled',
    timeInForce: 'DAY',
    createdAt: '2024-01-15 14:05:30',
    updatedAt: '2024-01-15 14:25:15',
    marketPrice: 21.50,
    priceDeviation: 6.3,
    estimatedTotal: 22850,
    symbol: 'SPACE'
  },
  {
    id: '5',
    type: 'limit',
    side: 'buy',
    price: 21.35,
    amount: 2500,
    filled: 500,
    remaining: 2000,
    status: 'pending',
    timeInForce: 'GTC',
    createdAt: '2024-01-15 14:01:45',
    updatedAt: '2024-01-15 14:15:22',
    marketPrice: 21.50,
    priceDeviation: -0.7,
    estimatedTotal: 53375.00,
    symbol: 'SPACE'
  }
];

export const LimitOrderBook: React.FC<LimitOrderBookProps> = ({
  orders = mockOrders,
  onCancelOrder,
  onModifyOrder,
  loading = false,
  error
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | OrderStatus>('all');
  const [filterSide, setFilterSide] = useState<'all' | OrderSide>('all');
  const [sortBy, setSortBy] = useState<'time' | 'price' | 'amount' | 'status'>('time');
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [newAmount, setNewAmount] = useState('');

  // Filter and sort orders
  const getFilteredAndSortedOrders = () => {
    let filtered = orders;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    // Filter by side
    if (filterSide !== 'all') {
      filtered = filtered.filter(order => order.side === filterSide);
    }

    // Sort orders
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price':
          return b.price - a.price;
        case 'amount':
          return b.amount - a.amount;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return sorted;
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
      try {
        const success = await onCancelOrder(orderId);
        if (success) {
          // Order cancelled successfully - in a real app, this would be handled by state management
        }
      } catch (error) {
        console.error('Failed to cancel order:', error);
      }
    }
  };

  const handleModifyOrder = async (orderId: string) => {
    if (onModifyOrder && newPrice && newAmount) {
      try {
        const success = await onModifyOrder(orderId, parseFloat(newPrice), parseFloat(newAmount));
        if (success) {
          setEditingOrder(null);
          setNewPrice('');
          setNewAmount('');
        }
      } catch (error) {
        console.error('Failed to modify order:', error);
      }
    }
  };

  const filteredOrders = getFilteredAndSortedOrders();

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      borderRadius: 'clamp(18px, 2.5vw, 26px)',
      background: 'linear-gradient(180deg, #572501, #572501 10%, #572501 58%, #7d3802 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      padding: 'clamp(16px, 3vh, 22px)',
      border: '1px solid rgba(255, 215, 165, 0.4)',
      overflow: 'hidden',
      color: '#fff7ea',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: 'clamp(8px, 1.5vh, 12px)'
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
          Active Limit Orders
        </h3>
      </div>

      {/* Filter and Sort Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: 'clamp(12px, 2vh, 16px)',
        flexWrap: 'wrap',
        padding: 'clamp(10px, 2vh, 14px) clamp(14px, 3vh, 18px)',
        background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.4), rgba(87, 37, 1, 0.3) 50%, rgba(87, 37, 1, 0.35) 100%)',
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
              minWidth: '80px'
            }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="filled">Filled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Side Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: 'clamp(11px, 2vw, 13px)',
            color: '#feea88',
            fontWeight: 800,
            textShadow: '0 1px 0 rgba(0, 0, 0, 0.4)',
            letterSpacing: '0.3px'
          }}>SIDE</span>
          <select
            value={filterSide}
            onChange={(e) => setFilterSide(e.target.value as any)}
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
              minWidth: '65px'
            }}
          >
            <option value="all">All</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        {/* Sort By */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: 'clamp(11px, 2vw, 13px)',
            color: '#feea88',
            fontWeight: 800,
            textShadow: '0 1px 0 rgba(0, 0, 0, 0.4)',
            letterSpacing: '0.3px'
          }}>SORT</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
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
              minWidth: '75px'
            }}
          >
            <option value="time">Time</option>
            <option value="price">Price</option>
            <option value="amount">Amount</option>
            <option value="status">Status</option>
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

      {/* Order List */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(180deg, #3a1c08, #2d1506)',
        border: '1px solid rgba(255, 215, 165, 0.4)',
        borderRadius: 'clamp(14px, 3vw, 20px)',
        padding: 'clamp(12px, 2.5vh, 16px)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        overflow: 'hidden'
      }}>
        <div style={{
          overflowY: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {loading && (
            <div style={{
              textAlign: 'center',
              color: '#feea88',
              padding: '20px',
              fontSize: 'clamp(12px, 2vw, 14px)'
            }}>
              Loading orders...
            </div>
          )}

          {error && (
            <div style={{
              textAlign: 'center',
              color: '#f87171',
              padding: '20px',
              fontSize: 'clamp(12px, 2vw, 14px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {!loading && !error && filteredOrders.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#feea88',
              padding: '40px 20px',
              fontSize: 'clamp(12px, 2vw, 14px)',
              opacity: 0.7
            }}>
              No limit orders found
            </div>
          )}

          {!loading && !error && filteredOrders.map((order) => (
            <div
              key={order.id}
              style={{
                padding: 'clamp(12px, 2vh, 16px)',
                borderRadius: 'clamp(8px, 1.5vw, 12px)',
                background: 'rgba(87, 37, 1, 0.3)',
                border: '1px solid rgba(255, 215, 165, 0.2)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              {/* Order Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Side Icon */}
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    background: order.side === 'buy'
                      ? 'linear-gradient(to right, #4ade80, #22c55e)'
                      : 'linear-gradient(to right, #f87171, #ef4444)',
                    color: 'white',
                    border: `1px solid ${order.side === 'buy' ? '#86efac' : '#fca5a5'}`
                  }}>
                    {order.side === 'buy' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  </div>

                  <span style={{
                    fontSize: 'clamp(12px, 2.2vw, 14px)',
                    fontWeight: 800,
                    color: order.side === 'buy' ? '#4ade80' : '#f87171',
                    textTransform: 'uppercase'
                  }}>
                    {order.side} LIMIT
                  </span>

                  {/* Status Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: 'clamp(10px, 1.6vw, 12px)',
                    fontWeight: 700,
                    color: getStatusColor(order.status),
                    textTransform: 'uppercase'
                  }}>
                    <span>{getStatusIcon(order.status)}</span>
                    {order.status.replace('-', ' ')}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setEditingOrder(order.id);
                          setNewPrice(order.price.toString());
                          setNewAmount(order.remaining.toString());
                        }}
                        style={{
                          background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
                          border: '1px solid rgba(255, 210, 160, 0.4)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          color: '#feea88',
                          fontSize: '10px'
                        }}
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        style={{
                          background: 'linear-gradient(180deg, #ffb1a6, #ff7a6f 60%, #ff5b58)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          color: '#2b1b14',
                          fontSize: '10px'
                        }}
                      >
                        <X size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Order Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px',
                fontSize: 'clamp(11px, 1.8vw, 13px)'
              }}>
                <div>
                  <span style={{ color: '#ffe0b6', opacity: 0.9, fontWeight: 600 }}>Price:</span>
                  <div style={{
                    color: '#feea88',
                    fontWeight: 700,
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ${order.price.toFixed(2)}
                    {order.priceDeviation && (
                      <span style={{
                        fontSize: '10px',
                        color: order.priceDeviation > 0 ? '#4ade80' : '#f87171',
                        fontWeight: 600
                      }}>
                        ({order.priceDeviation > 0 ? '+' : ''}{order.priceDeviation.toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#ffe0b6', opacity: 0.9, fontWeight: 600 }}>Amount:</span>
                  <div style={{ color: '#feea88', fontWeight: 700, marginTop: '2px' }}>
                    {formatAmount(order.amount)}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#ffe0b6', opacity: 0.9, fontWeight: 600 }}>Filled:</span>
                  <div style={{ color: '#feea88', fontWeight: 700, marginTop: '2px' }}>
                    {formatAmount(order.filled)} / {formatAmount(order.amount)}
                    <span style={{ fontSize: '10px', opacity: 0.8, marginLeft: '4px' }}>
                      ({((order.filled / order.amount) * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ color: '#ffe0b6', opacity: 0.9, fontWeight: 600 }}>Total:</span>
                  <div style={{ color: '#feea88', fontWeight: 700, marginTop: '2px' }}>
                    ${order.estimatedTotal.toFixed(2)}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#ffe0b6', opacity: 0.9, fontWeight: 600 }}>Time:</span>
                  <div style={{
                    color: '#feea88',
                    fontWeight: 700,
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={10} />
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#ffe0b6', opacity: 0.9, fontWeight: 600 }}>TIF:</span>
                  <div style={{ color: '#feea88', fontWeight: 700, marginTop: '2px' }}>
                    {order.timeInForce}
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              {editingOrder === order.id && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 215, 165, 0.3)'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr auto auto',
                    gap: '8px',
                    alignItems: 'end'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '10px',
                        color: '#feea88',
                        marginBottom: '4px',
                        fontWeight: 600
                      }}>
                        New Price
                      </label>
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        step="0.01"
                        style={{
                          width: '100%',
                          background: 'rgba(0, 0, 0, 0.5)',
                          border: '1px solid rgba(255, 215, 165, 0.3)',
                          borderRadius: '4px',
                          padding: '6px 8px',
                          color: '#feea88',
                          fontSize: '11px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '10px',
                        color: '#feea88',
                        marginBottom: '4px',
                        fontWeight: 600
                      }}>
                        New Amount
                      </label>
                      <input
                        type="number"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        step="0.01"
                        style={{
                          width: '100%',
                          background: 'rgba(0, 0, 0, 0.5)',
                          border: '1px solid rgba(255, 215, 165, 0.3)',
                          borderRadius: '4px',
                          padding: '6px 8px',
                          color: '#feea88',
                          fontSize: '11px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <button
                      onClick={() => handleModifyOrder(order.id)}
                      style={{
                        background: 'linear-gradient(180deg, #4ade80, #22c55e)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        color: '#1f2937',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      UPDATE
                    </button>
                    <button
                      onClick={() => {
                        setEditingOrder(null);
                        setNewPrice('');
                        setNewAmount('');
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255, 215, 165, 0.3)',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        color: '#feea88',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};