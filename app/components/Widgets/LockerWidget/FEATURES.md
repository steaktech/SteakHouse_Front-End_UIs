# LockerWidget - Feature Highlights

## 🎨 Design Philosophy

The LockerWidget follows the same professional design language as your existing widgets:
- **Amber/Caramel Theme**: Warm, inviting color palette matching TokenWidget, SavedToken, and SteakHoldersWidget
- **UNCX-Inspired**: Professional token locker functionality inspired by industry standards
- **Consistent Styling**: Uses the same gradient backgrounds, borders, and animations
- **Premium Feel**: High-quality visual effects with smooth transitions

## 📐 Layout Structure

### Two Main Tabs

#### 1. **Create Lock Tab** 
```
┌─────────────────────────────────────┐
│  🔒 Token Locker                    │
│  Lock tokens securely for any...   │
│  ┌─────────┬─────────┐             │
│  │ CREATE  │ MANAGE  │             │
│  └─────────┴─────────┘             │
├─────────────────────────────────────┤
│  TOKEN CONTRACT ADDRESS             │
│  [0x................................]│
│                                     │
│  AMOUNT TO LOCK                     │
│  [0.0............................]  │
│                                     │
│  LOCK DURATION                      │
│  [7 Days] [14 Days] [30 Days]      │
│  [90 Days] [180 Days] [365 Days]   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Lock Duration: 30 Days      │   │
│  │ Unlock Date: Dec 5, 2025    │   │
│  └─────────────────────────────┘   │
│                                     │
│  [        CREATE LOCK        ]      │
└─────────────────────────────────────┘
```

#### 2. **Manage Locks Tab**
```
┌─────────────────────────────────────┐
│  🔒 Token Locker                    │
│  Lock tokens securely for any...   │
│  ┌─────────┬─────────┐             │
│  │ CREATE  │ MANAGE  │             │
│  └─────────┴─────────┘             │
├─────────────────────────────────────┤
│  [Search by name, symbol...]        │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🅰️ Amber Launch    [ACTIVE]  │ │
│  │    AMBR                       │ │
│  │  ┌─────────┬─────────┐       │ │
│  │  │Amount   │Time Left│       │ │
│  │  │1.00M    │57d 14h  │       │ │
│  │  ├─────────┼─────────┤       │ │
│  │  │Locked On│Unlock   │       │ │
│  │  │Sep 1    │Dec 1    │       │ │
│  │  └─────────┴─────────┘       │ │
│  │  [▓▓▓▓▓▓░░░░] 65%            │ │
│  │  [    LOCKED    ] [🔗]       │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

## ✨ Key Features

### 🎯 Create Lock Functionality
- **Token Address Input**: Enter any ERC-20 token contract address
- **Amount Input**: Specify exact amount to lock
- **Duration Presets**: 6 quick-select options (7, 14, 30, 90, 180, 365 days)
- **Date Preview**: See unlock date before confirming
- **Form Validation**: Ensures all fields are filled
- **Loading States**: Shows progress during lock creation

### 📊 Manage Locks Interface
- **Lock Cards**: Beautiful cards displaying all lock information
- **Status Badges**: 
  - 🟢 **ACTIVE** (green) - Lock is currently active
  - 🟡 **EXPIRED** (amber) - Lock period ended, ready to unlock
  - ⚪ **UNLOCKED** (gray) - Tokens have been withdrawn
- **Search Functionality**: Filter by token name, symbol, or address
- **Progress Bars**: Animated bars showing lock progress
- **Time Remaining**: Live countdown (e.g., "57d 14h", "3h 25m")
- **Action Buttons**: 
  - Unlock button (enabled when withdrawable)
  - View on explorer button

### 🎨 Visual Elements

#### Color Scheme
```css
Primary Background: #572501 → #7d3802 (gradient)
Accent Gold: #ffedae → #ffd96f
Text Primary: #feea88
Text Secondary: #ffe2be
Borders: rgba(255, 215, 165, 0.45)
```

#### Interactive Elements
- **Hover Effects**: Smooth color transitions and scale transforms
- **Active States**: Golden gradient on selected buttons
- **Focus States**: Glowing borders on focused inputs
- **Transitions**: 200ms ease timing for all interactions

#### Animations
- **Progress Bars**: Smooth width transitions with glow effects
- **Modal Entry**: Fade in with backdrop blur
- **Button Presses**: Scale-down on click for tactile feedback
- **Loading Spinner**: Rotating border animation

### 📱 Responsive Design

#### Desktop (>768px)
- 600px wide panel
- 3-column duration grid
- 2-column lock details grid
- Large, spacious layout

#### Tablet (480px - 768px)
- Full width minus 20px margin
- 2-column duration grid
- Single column lock details
- Optimized spacing

#### Mobile (<480px)
- Full width minus 16px margin
- 2-column duration grid
- Single column layout
- Compact button sizes
- Touch-optimized interactions

### ♿ Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Visible focus indicators
- **Semantic HTML**: Proper heading hierarchy
- **ESC Key**: Close widget with Escape key
- **Tab Order**: Logical tab navigation

### 🔧 Technical Features

#### State Management
- Local state for form data
- Filtered and sorted lock lists
- Loading states for async operations
- Search query management

#### Data Handling
- Demo data included for testing
- Optional custom data prop
- Real-time filtering and sorting
- Lock status updates

#### Integration Hooks
- `onLockCreate`: Custom lock creation handler
- `onUnlock`: Custom unlock handler
- Flexible for any blockchain/backend integration

## 🚀 Performance

- **CSS Modules**: Scoped styling, no conflicts
- **Optimized Rendering**: React memoization where needed
- **Smooth Animations**: Hardware-accelerated CSS transforms
- **Lazy Calculations**: Lock progress calculated on-demand
- **Efficient Filtering**: Optimized search and sort algorithms

## 🎭 User Experience

### Intuitive Flow
1. Click to open widget
2. Choose "Create Lock" or "Manage Locks"
3. Fill form or search existing locks
4. See real-time updates and feedback
5. Confirm actions with clear CTAs

### Visual Feedback
- Disabled states for invalid actions
- Loading indicators during operations
- Success states after completion
- Error handling with alerts

### Professional Polish
- Consistent spacing and alignment
- Rounded corners and shadows
- Smooth color transitions
- Premium typography (Sora font family)

## 📦 File Structure

```
LockerWidget/
├── LockerWidget.tsx          # Main component (533 lines)
├── LockerWidget.module.css   # Comprehensive styling (693 lines)
├── types.ts                  # TypeScript interfaces (40 lines)
├── index.ts                  # Exports (10 lines)
├── example-usage.tsx         # Usage examples (82 lines)
├── README.md                 # Documentation (217 lines)
└── FEATURES.md               # This file
```

## 🎯 Comparison with Other Widgets

| Feature | TokenWidget | SavedToken | SteakHolders | **LockerWidget** |
|---------|-------------|------------|--------------|------------------|
| Tabs | ❌ | ❌ | ✅ | ✅ |
| Form Inputs | ❌ | ❌ | ✅ | ✅ |
| Search | ❌ | ✅ | ✅ | ✅ |
| Progress Bars | ✅ | ❌ | ✅ | ✅ |
| Status Badges | ✅ | ❌ | ✅ | ✅ |
| Action Buttons | ❌ | ✅ | ❌ | ✅ |
| Duration Presets | ❌ | ❌ | ❌ | ✅ |
| Time Countdown | ❌ | ❌ | ❌ | ✅ |

## 🌟 Unique Features

1. **Dual-Mode Interface**: Both creation and management in one widget
2. **Duration Presets**: Quick-select common lock periods
3. **Live Countdown**: Real-time time remaining calculation
4. **Progress Visualization**: Animated progress bars
5. **Status Management**: Three distinct lock states
6. **Date Formatting**: Human-readable dates and times
7. **Compact Numbers**: Intelligent number formatting (1.5M, 500K, etc.)
8. **Demo Mode**: Works standalone without backend integration

---

**Built with ❤️ for professional token management**
