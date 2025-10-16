# LockerWidget - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Import the Component

```tsx
import { LockerWidget } from '@/app/components/Widgets/LockerWidget';
import { useState } from 'react';
```

### Step 2: Add State Management

```tsx
function MyComponent() {
  const [isLockerOpen, setIsLockerOpen] = useState(false);
  
  // ... rest of your component
}
```

### Step 3: Render the Widget

```tsx
return (
  <div>
    <button onClick={() => setIsLockerOpen(true)}>
      Open Token Locker
    </button>
    
    <LockerWidget
      isOpen={isLockerOpen}
      onClose={() => setIsLockerOpen(false)}
    />
  </div>
);
```

**That's it!** The widget will work with demo data out of the box.

---

## 📝 Complete Example

```tsx
"use client";

import React, { useState } from 'react';
import { LockerWidget } from '@/app/components/Widgets/LockerWidget';

export default function MyPage() {
  const [isLockerOpen, setIsLockerOpen] = useState(false);

  return (
    <div className="my-page">
      <h1>Token Management</h1>
      
      <button 
        onClick={() => setIsLockerOpen(true)}
        className="open-locker-btn"
      >
        🔒 Open Token Locker
      </button>

      <LockerWidget
        isOpen={isLockerOpen}
        onClose={() => setIsLockerOpen(false)}
      />
    </div>
  );
}
```

---

## 🎮 Try It Out

The widget includes:
- ✅ **3 Demo Locks**: Amber Launch, Ethereum, and SteakCoin
- ✅ **Create Lock Form**: Fully functional with validation
- ✅ **Search & Filter**: Test the search functionality
- ✅ **Progress Bars**: Animated progress indicators
- ✅ **Status Badges**: Active, Expired, and Unlocked states

---

## 🔌 Adding Your Own Data

### Option 1: Pass Custom Lock Data

```tsx
import { TokenLock } from '@/app/components/Widgets/LockerWidget';

const myLocks: TokenLock[] = [
  {
    id: '1',
    tokenAddress: '0xYourAddress',
    tokenName: 'My Token',
    tokenSymbol: 'MTK',
    amount: 1000000,
    lockedAt: new Date('2025-09-01'),
    unlockDate: new Date('2026-01-01'),
    status: 'active',
    owner: '0xOwnerAddress',
    withdrawable: false,
  },
];

<LockerWidget
  isOpen={isLockerOpen}
  onClose={() => setIsLockerOpen(false)}
  data={myLocks}
/>
```

### Option 2: Add Lock Creation Handler

```tsx
import { LockFormData } from '@/app/components/Widgets/LockerWidget';

const handleCreateLock = async (formData: LockFormData) => {
  console.log('Creating lock:', formData);
  // Add your blockchain/API logic here
};

<LockerWidget
  isOpen={isLockerOpen}
  onClose={() => setIsLockerOpen(false)}
  onLockCreate={handleCreateLock}
/>
```

### Option 3: Add Unlock Handler

```tsx
const handleUnlock = async (lockId: string) => {
  console.log('Unlocking:', lockId);
  // Add your blockchain/API logic here
};

<LockerWidget
  isOpen={isLockerOpen}
  onClose={() => setIsLockerOpen(false)}
  onUnlock={handleUnlock}
/>
```

---

## 🎨 Styling

The widget is **fully styled** and matches your existing widgets. No additional CSS needed!

However, you can customize it by:
1. Modifying `LockerWidget.module.css`
2. Adjusting CSS variables at the top of the file
3. Overriding specific classes if needed

---

## 📱 It's Already Responsive!

The widget automatically adjusts for:
- 🖥️ **Desktop** (>768px): Full-featured layout
- 📱 **Tablet** (480-768px): Optimized layout
- 📱 **Mobile** (<480px): Compact, touch-friendly design

---

## ⌨️ Keyboard Shortcuts

- **ESC** - Close the widget
- **TAB** - Navigate through form fields
- **ENTER** - Submit form when all fields are filled

---

## 🐛 Troubleshooting

### Widget doesn't open?
- Check that `isOpen={true}` is being set
- Verify the import path is correct

### Styling looks off?
- Make sure `LockerWidget.module.css` is in the same directory
- Check that CSS modules are enabled in your Next.js config

### Icons not showing?
- Install `lucide-react`: `npm install lucide-react`
- The widget uses: X, Lock, Unlock, Clock, ExternalLink

---

## 📚 Next Steps

- 📖 Read [README.md](./README.md) for full documentation
- ✨ Check [FEATURES.md](./FEATURES.md) for feature details
- 💻 View [example-usage.tsx](./example-usage.tsx) for more examples

---

## 🎉 You're All Set!

Your LockerWidget is ready to use. Start locking tokens securely! 🔒

**Need help?** Check the other documentation files or examine the existing widgets in the `Widgets/` directory for reference.
