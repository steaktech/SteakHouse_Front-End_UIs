/**
 * Example Usage of LockerWidget
 * 
 * This file demonstrates how to integrate the LockerWidget into your application.
 * Copy and adapt this code to use the widget in your own components.
 */

"use client";

import React, { useState } from 'react';
import { LockerWidget } from './LockerWidget';
import type { TokenLock, LockFormData } from './types';

export function LockerWidgetExample() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Optional: Provide your own lock data
  const customLocks: TokenLock[] = [
    {
      id: '1',
      tokenAddress: '0xYourTokenAddress',
      tokenName: 'Your Token',
      tokenSymbol: 'YTK',
      amount: 1000000,
      lockedAt: new Date('2025-09-01'),
      unlockDate: new Date('2026-01-01'),
      status: 'active',
      owner: '0xYourAddress',
      withdrawable: false,
    },
  ];

  // Optional: Handle lock creation
  const handleLockCreate = async (formData: LockFormData) => {
    console.log('Creating lock with:', formData);
    // Add your blockchain/backend logic here
    // Example: await contract.createLock(formData.tokenAddress, formData.amount, formData.lockDuration);
  };

  // Optional: Handle unlock
  const handleUnlock = async (lockId: string) => {
    console.log('Unlocking lock:', lockId);
    // Add your blockchain/backend logic here
    // Example: await contract.unlock(lockId);
  };

  return (
    <div>
      {/* Trigger button */}
      <button onClick={() => setIsOpen(true)}>
        Open Token Locker
      </button>

      {/* Widget component */}
      <LockerWidget
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={customLocks} // Optional: pass your own data
        onLockCreate={handleLockCreate} // Optional: handle lock creation
        onUnlock={handleUnlock} // Optional: handle unlock
      />
    </div>
  );
}

// Simple usage without custom handlers (uses demo data)
export function SimpleLockerWidgetExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Open Locker
      </button>

      <LockerWidget
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
