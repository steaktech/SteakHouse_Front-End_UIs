"use client";

import { useState, useCallback } from 'react';
import { LimitOrder, OrderFormData, OrderExecutionResult, OrderStatus } from './types';

// Mock data for demonstration
const initialOrders: LimitOrder[] = [
  {
    id: '1',
    type: 'limit',
    side: 'buy',
    price: 21.20,
    amount: 1500,
    filled: 0,
    remaining: 1500,
    status: 'pending',
    timeInForce: 'GTC',
    createdAt: '2024-01-15 14:23:45',
    updatedAt: '2024-01-15 14:23:45',
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
    filled: 0,
    remaining: 2500,
    status: 'pending',
    timeInForce: 'GTC',
    createdAt: '2024-01-15 14:01:45',
    updatedAt: '2024-01-15 14:01:45',
    marketPrice: 21.50,
    priceDeviation: -0.7,
    estimatedTotal: 53375.00,
    symbol: 'SPACE'
  },
  {
    id: '6',
    type: 'limit',
    side: 'sell',
    price: 21.95,
    amount: 1800,
    filled: 0,
    remaining: 1800,
    status: 'pending',
    timeInForce: 'GTC',
    createdAt: '2024-01-15 13:58:12',
    updatedAt: '2024-01-15 13:58:12',
    marketPrice: 21.50,
    priceDeviation: 2.1,
    estimatedTotal: 39510,
    symbol: 'SPACE'
  },
  {
    id: '7',
    type: 'limit',
    side: 'buy',
    price: 20.75,
    amount: 4000,
    filled: 4000,
    remaining: 0,
    status: 'filled',
    timeInForce: 'IOC',
    createdAt: '2024-01-15 13:45:28',
    updatedAt: '2024-01-15 13:47:15',
    marketPrice: 21.50,
    priceDeviation: -3.5,
    estimatedTotal: 83000,
    symbol: 'SPACE'
  },
  {
    id: '8',
    type: 'limit',
    side: 'sell',
    price: 22.25,
    amount: 1200,
    filled: 1200,
    remaining: 0,
    status: 'filled',
    timeInForce: 'GTC',
    createdAt: '2024-01-15 13:30:15',
    updatedAt: '2024-01-15 13:32:45',
    marketPrice: 21.50,
    priceDeviation: 3.5,
    estimatedTotal: 26700,
    symbol: 'SPACE'
  },
  {
    id: '9',
    type: 'limit',
    side: 'buy',
    price: 20.50,
    amount: 2800,
    filled: 0,
    remaining: 2800,
    status: 'cancelled',
    timeInForce: 'DAY',
    createdAt: '2024-01-15 13:15:30',
    updatedAt: '2024-01-15 14:30:00',
    marketPrice: 21.50,
    priceDeviation: -4.7,
    estimatedTotal: 57400,
    symbol: 'SPACE'
  },
  {
    id: '10',
    type: 'limit',
    side: 'sell',
    price: 23.00,
    amount: 900,
    filled: 0,
    remaining: 900,
    status: 'cancelled',
    timeInForce: 'GTC',
    createdAt: '2024-01-15 13:00:45',
    updatedAt: '2024-01-15 14:45:20',
    marketPrice: 21.50,
    priceDeviation: 7.0,
    estimatedTotal: 20700,
    symbol: 'SPACE'
  },
  {
    id: '11',
    type: 'limit',
    side: 'buy',
    price: 21.45,
    amount: 3500,
    filled: 3500,
    remaining: 0,
    status: 'filled',
    timeInForce: 'GTC',
    createdAt: '2024-01-15 12:45:12',
    updatedAt: '2024-01-15 12:46:33',
    marketPrice: 21.50,
    priceDeviation: -0.2,
    estimatedTotal: 75075,
    symbol: 'SPACE'
  },
  {
    id: '12',
    type: 'limit',
    side: 'sell',
    price: 24.50,
    amount: 600,
    filled: 0,
    remaining: 600,
    status: 'cancelled',
    timeInForce: 'DAY',
    createdAt: '2024-01-15 12:30:25',
    updatedAt: '2024-01-15 15:00:00',
    marketPrice: 21.50,
    priceDeviation: 14.0,
    estimatedTotal: 14700,
    symbol: 'SPACE'
  }
];

export const useOrderManagement = () => {
  const [orders, setOrders] = useState<LimitOrder[]>(initialOrders);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Current market price (mock)
  const currentPrice = 21.50;

  const createOrder = useCallback(async (orderData: OrderFormData): Promise<OrderExecutionResult> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock validation
      if (!orderData.price || !orderData.amount) {
        throw new Error('Price and amount are required');
      }

      const price = parseFloat(orderData.price);
      const amount = parseFloat(orderData.amount);

      if (price <= 0 || amount <= 0) {
        throw new Error('Price and amount must be positive');
      }

      // Create new order
      const newOrder: LimitOrder = {
        id: Date.now().toString(),
        type: orderData.type,
        side: orderData.side,
        price,
        amount,
        filled: 0,
        remaining: amount,
        status: 'pending',
        timeInForce: orderData.timeInForce,
        createdAt: new Date().toISOString().replace('T', ' ').split('.')[0],
        updatedAt: new Date().toISOString().replace('T', ' ').split('.')[0],
        marketPrice: currentPrice,
        priceDeviation: ((price - currentPrice) / currentPrice * 100),
        estimatedTotal: price * amount,
        symbol: 'SPACE',
        notes: orderData.notes
      };

      // Add to orders
      setOrders(prev => [newOrder, ...prev]);

      // Simulate fills for demo
      setTimeout(() => {
        const shouldFill = Math.random() > 0.7;
        if (shouldFill) {
          setOrders(prev => prev.map(order => {
            if (order.id === newOrder.id) {
              return {
                ...order,
                filled: amount,
                remaining: 0,
                status: 'filled' as OrderStatus,
                updatedAt: new Date().toISOString().replace('T', ' ').split('.')[0]
              };
            }
            return order;
          }));
        }
      }, 2000 + Math.random() * 5000);

      return {
        success: true,
        orderId: newOrder.id,
        message: `${orderData.side.toUpperCase()} limit order placed successfully`
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Order creation failed';
      setError(message);
      return {
        success: false,
        message
      };
    } finally {
      setLoading(false);
    }
  }, [currentPrice]);

  const cancelOrder = useCallback(async (orderId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      setOrders(prev => prev.map(order => {
        if (order.id === orderId && order.status === 'pending') {
          return {
            ...order,
            status: 'cancelled' as OrderStatus,
            updatedAt: new Date().toISOString().replace('T', ' ').split('.')[0]
          };
        }
        return order;
      }));

      return true;
    } catch (err) {
      setError('Failed to cancel order');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const modifyOrder = useCallback(async (orderId: string, newPrice: number, newAmount: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));

      setOrders(prev => prev.map(order => {
        if (order.id === orderId && order.status === 'pending') {
          const remaining = newAmount - order.filled;
          return {
            ...order,
            price: newPrice,
            amount: newAmount,
            remaining: Math.max(0, remaining),
            priceDeviation: ((newPrice - currentPrice) / currentPrice * 100),
            estimatedTotal: newPrice * newAmount,
            updatedAt: new Date().toISOString().replace('T', ' ').split('.')[0]
          };
        }
        return order;
      }));

      return true;
    } catch (err) {
      setError('Failed to modify order');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentPrice]);

  const getActiveOrders = useCallback(() => {
    return orders.filter(order => order.status === 'pending');
  }, [orders]);

  const getOrderHistory = useCallback(() => {
    return orders.filter(order => order.status === 'filled' || order.status === 'cancelled');
  }, [orders]);

  const getOrderStats = useCallback(() => {
    const activeOrders = getActiveOrders();
    const totalActiveValue = activeOrders.reduce((sum, order) => sum + order.estimatedTotal, 0);
    const buyOrders = activeOrders.filter(order => order.side === 'buy').length;
    const sellOrders = activeOrders.filter(order => order.side === 'sell').length;

    return {
      activeCount: activeOrders.length,
      totalActiveValue,
      buyOrders,
      sellOrders
    };
  }, [getActiveOrders]);

  return {
    orders,
    loading,
    error,
    currentPrice,
    createOrder,
    cancelOrder,
    modifyOrder,
    getActiveOrders,
    getOrderHistory,
    getOrderStats,
    clearError: () => setError(null)
  };
};