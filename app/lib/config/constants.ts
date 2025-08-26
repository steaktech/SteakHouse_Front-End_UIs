// lib/config/constants.ts

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Default placeholder image for tokens
export const DEFAULT_TOKEN_IMAGE = '/images/info_icon.jpg';

// Token type mappings
export const TOKEN_TYPE_LABELS = {
  0: 'Basic',
  1: 'Advanced',
  2: 'Stealth',
  3: 'Super Simple',
  4: 'Zero Simple'
} as const;

// Token tag colors based on type
export const TOKEN_TAG_COLORS = {
  'Basic': 'bg-blue-500/20 text-blue-300',
  'Advanced': 'bg-purple-500/20 text-purple-300',
  'Stealth': 'bg-gray-500/20 text-gray-300',
  'Super Simple': 'bg-green-500/20 text-green-300',
  'Zero Simple': 'bg-yellow-500/20 text-yellow-300',
  'Meme': 'bg-[#fade79] text-black',
  'Utility': 'bg-orange-500/20 text-orange-300'
} as const;
