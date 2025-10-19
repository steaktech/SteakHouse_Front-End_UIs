export type LockStatus = 'active' | 'expired' | 'unlocked';

export interface TokenLock {
  id: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  amount: number;
  lockedAt: Date;
  unlockDate: Date;
  status: LockStatus;
  owner: string;
  withdrawable: boolean;
}

export interface LockFormData {
  tokenAddress: string;
  amount: string;
  lockDuration: number; // in days
  customDuration?: number;
}

export type TabType = 'create' | 'manage';
export type DurationPreset = 7 | 14 | 30 | 90 | 180 | 365;

export interface LockerWidgetState {
  activeTab: TabType;
  formData: LockFormData;
  searchQuery: string;
  sortBy: 'date' | 'amount' | 'status';
  sortOrder: 'asc' | 'desc';
}

export interface LockerWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  data?: TokenLock[];
  onLockCreate?: (formData: LockFormData) => Promise<void>;
  onUnlock?: (lockId: string) => Promise<void>;
  onTransferOwnership?: (lockId: string, newOwnerAddress: string) => Promise<void>;
  onExtendLock?: (lockId: string, additionalDays: number) => Promise<void>;
}
