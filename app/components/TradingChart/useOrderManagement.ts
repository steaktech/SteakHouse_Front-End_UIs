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
    amount: 150,
    filled: 75,
    remaining: 75,
    status: 'pending',
    timeInForce: 'GTC',
    createdAt: '2024-01-15 14:23:45',
    updatedAt: '2024-01-15 14:35:12',
    marketPrice: 21.50,
    priceDeviation: -1.4,
    estimatedTotal: 3180,
    symbol: 'SPACE'
  },
  {
    id: '2',
    type: 'limit',
    side: 'sell',
    price: 22.10,
    amount: 200,
    filled: 0,
    remaining: 200,
    status: 'pending',
    timeInForce: 'GTC',
    createdAt: '2024-01-15 14:18:20',
    updatedAt: '2024-01-15 14:18:20',
    marketPrice: 21.50,
    priceDeviation: 2.8,
    estimatedTotal: 4420,
    symbol: 'SPACE'
  },
  {
    id: '3',
    type: 'limit',
    side: 'buy',
    price: 20.95,
    amount: 300,
    filled: 300,
    remaining: 0,
    status: 'filled',
    timeInForce: 'IOC',
    createdAt: '2024-01-15 14:10:15',
    updatedAt: '2024-01-15 14:12:33',
    marketPrice: 21.50,
    priceDeviation: -2.6,
    estimatedTotal: 6285,
    symbol: 'SPACE'
  },
  {
    id: '4',
    type: 'limit',
    side: 'sell',
    price: 22.85,
    amount: 100,
    filled: 0,
    remaining: 100,
    status: 'cancelled',
    timeInForce: 'DAY',
    createdAt: '2024-01-15 14:05:30',
    updatedAt: '2024-01-15 14:25:15',
    marketPrice: 21.50,
    priceDeviation: 6.3,
    estimatedTotal: 2285,
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