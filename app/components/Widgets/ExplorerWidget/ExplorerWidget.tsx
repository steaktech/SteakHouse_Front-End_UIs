"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Search, TrendingUp, TrendingDown, Clock, Users, Eye, MessageCircle, ThumbsUp, Flame, Award, AlertTriangle, ExternalLink, ChevronLeft, ChevronRight, Hash, Type } from 'lucide-react';
import styles from './ExplorerWidget.module.css';
import {
  ExplorerWidgetProps,
  ExplorerWidgetState,
  TokenPair,
  SectionType,
  ExplorerSection
} from './types';
import type { Token, FullTokenDataResponse } from '@/app/types/token';
import { useExplorerRecent, useExplorerGraduated, useExplorerNearlyGraduated } from '@/app/hooks/useExplorerTokens';
import { useRouter } from 'next/navigation';
import { getFullTokenData } from '@/app/lib/api/services/tokenService';
import { normalizeEthereumAddress } from '@/app/lib/utils/addressValidation';
import { useNameSearch } from '@/app/hooks/useNameSearch';

/*
// Demo data for explorer
const demoExplorerData: ExplorerSection[] = [
  {
    id: 'newly-created',
    title: 'Newly Created',
    description: 'Recently launched token pairs',
    pairs: [
      {
        id: '1',
        name: 'Ben The Bunny',
        symbol: 'BEN',
        address: '0xA3bC4D5E6f78901234567890aBCDeF1234567890',
        creator: '0x742d35...',
        marketCap: 1400,
        price: 0.000014,
        volume24h: 9400,
        priceChange24h: 30,
        holders: 52,
        replies: 17,
        views: 78,
        createdAt: new Date('2025-10-06T17:30:00Z'),
        status: 'newly-created',
        chain: 'EVM',
        tags: ['Meme', 'Animal'],
      },
      {
        id: '2',
        name: 'COMPANIONS OpenAI',
        symbol: 'COMP',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        creator: '0x8b5a2c...',
        marketCap: 375,
        price: 0.0000375,
        volume24h: 7300,
        priceChange24h: -12,
        holders: 2,
        replies: 5,
        views: 3,
        createdAt: new Date('2025-10-06T17:15:00Z'),
        status: 'newly-created',
        chain: 'EVM',
        tags: ['AI', 'Utility'],
      },
      {
        id: '3',
        name: 'SCT Simulation Cycle',
        symbol: 'SCT',
        address: '0xabcdef1234567890abcdef1234567890abcdef12',
        creator: '0x3f1b8d...',
        marketCap: 2000,
        price: 0.00002,
        volume24h: 6600,
        priceChange24h: 0,
        holders: 1,
        replies: 0,
        views: 0,
        createdAt: new Date('2025-10-06T17:00:00Z'),
        status: 'newly-created',
        chain: 'EVM',
        tags: ['Governance'],
      },
      {
        id: '10',
        name: 'Moon Rocket',
        symbol: 'MOON',
        address: '0xaaaa1111bbbb2222cccc3333dddd4444eeee5555',
        creator: '0x9a3f2e...',
        marketCap: 850,
        price: 0.0000085,
        volume24h: 5200,
        priceChange24h: 45,
        holders: 28,
        replies: 12,
        views: 56,
        createdAt: new Date('2025-10-06T16:45:00Z'),
        status: 'newly-created',
        chain: 'EVM',
        tags: ['Meme'],
      },
      {
        id: '11',
        name: 'Charity Wave',
        symbol: 'WAVE',
        address: '0xbbbb2222cccc3333dddd4444eeee5555ffff6666',
        creator: '0x4c7e1a...',
        marketCap: 1200,
        price: 0.000012,
        volume24h: 4100,
        priceChange24h: 18,
        holders: 34,
        replies: 8,
        views: 42,
        createdAt: new Date('2025-10-06T16:30:00Z'),
        status: 'newly-created',
        chain: 'EVM',
        tags: ['Charity'],
      },
      {
        id: '12',
        name: 'Viral Meme Cat',
        symbol: 'VCAT',
        address: '0xcccc3333dddd4444eeee5555ffff6666aaaa7777',
        creator: '0x7f2c9b...',
        marketCap: 650,
        price: 0.0000065,
        volume24h: 3800,
        priceChange24h: -8,
        holders: 19,
        replies: 6,
        views: 31,
        createdAt: new Date('2025-10-06T16:15:00Z'),
        status: 'newly-created',
        chain: 'EVM',
        tags: ['Viral Post', 'Animal'],
      },
      {
        id: '13',
        name: 'AI Vision',
        symbol: 'AIVN',
        address: '0xdddd4444eeee5555ffff6666aaaa7777bbbb8888',
        creator: '0x2d8e3f...',
        marketCap: 980,
        price: 0.0000098,
        volume24h: 6700,
        priceChange24h: 22,
        holders: 41,
        replies: 15,
        views: 67,
        createdAt: new Date('2025-10-06T16:00:00Z'),
        status: 'newly-created',
        chain: 'EVM',
        tags: ['AI'],
      },
      {
        id: '14',
        name: 'Privacy Token',
        symbol: 'PRVT',
        address: '0xeeee5555ffff6666aaaa7777bbbb8888cccc9999',
        creator: '0x6b1f4c...',
        marketCap: 1600,
        price: 0.000016,
        volume24h: 5900,
        priceChange24h: -5,
        holders: 23,
        replies: 4,
        views: 28,
        createdAt: new Date('2025-10-06T15:45:00Z'),
        status: 'newly-created',
        chain: 'EVM',
        tags: ['Privacy'],
      },
      {
        id: '15',
        name: 'Doge Supreme',
        symbol: 'DSUP',
        address: '0xffff6666aaaa7777bbbb8888cccc9999dddd0000',
        creator: '0x3e9a7d...',
        marketCap: 2200,
        price: 0.000022,
        volume24h: 8100,
        priceChange24h: 55,
        holders: 67,
        replies: 21,
        views: 89,
        createdAt: new Date('2025-10-06T15:30:00Z'),
        status: 'newly-created',
        chain: 'EVM',
        tags: ['Meme', 'Animal'],
      },
      {
        id: '16',
        name: 'Utility Pro',
        symbol: 'UPRO',
        address: '0xaaaa7777bbbb8888cccc9999dddd0000eeee1111',
        creator: '0x5c2f8e...',
        marketCap: 1050,
        price: 0.0000105,
        volume24h: 4500,
        priceChange24h: 12,
        holders: 30,
        replies: 9,
        views: 45,
        createdAt: new Date('2025-10-06T15:15:00Z'),
        status: 'newly-created',
        chain: 'EVM',
        tags: ['Utility'],
      },
      {
        id: '17',
        name: 'GovernDAO',
        symbol: 'GDAO',
        address: '0xbbbb8888cccc9999dddd0000eeee1111ffff2222',
        creator: '0x8f3d1a...',
        marketCap: 1800,
        price: 0.000018,
        volume24h: 7200,
        priceChange24h: -15,
        holders: 45,
        replies: 11,
        views: 52,
        createdAt: new Date('2025-10-06T15:00:00Z'),
        status: 'newly-created',
        chain: 'EVM',
        tags: ['Governance'],
      },
      {
        id: '18',
        name: 'Viral Sensation',
        symbol: 'VSEN',
        address: '0xcccc9999dddd0000eeee1111ffff2222aaaa3333',
        creator: '0x1a7c9f...',
        marketCap: 720,
        price: 0.0000072,
        volume24h: 3200,
        priceChange24h: 38,
        holders: 16,
        replies: 7,
        views: 35,
        createdAt: new Date('2025-10-06T14:45:00Z'),
        status: 'newly-created',
        chain: 'EVM',
        tags: ['Viral Post'],
      },
      {
        id: '19',
        name: 'Animal Kingdom',
        symbol: 'ANKD',
        address: '0xdddd0000eeee1111ffff2222aaaa3333bbbb4444',
        creator: '0x9e4f2c...',
        marketCap: 1350,
        price: 0.0000135,
        volume24h: 6300,
        priceChange24h: 25,
        holders: 38,
        replies: 13,
        views: 61,
        createdAt: new Date('2025-10-06T14:30:00Z'),
        status: 'newly-created',
        chain: 'EVM',
        tags: ['Animal'],
      },
      {
        id: '20',
        name: 'Charity Heart',
        symbol: 'CHRT',
        address: '0xeeee1111ffff2222aaaa3333bbbb4444cccc5555',
        creator: '0x4d8a1f...',
        marketCap: 890,
        price: 0.0000089,
        volume24h: 4800,
        priceChange24h: -3,
        holders: 27,
        replies: 5,
        views: 33,
        createdAt: new Date('2025-10-06T14:15:00Z'),
        status: 'newly-created',
        chain: 'EVM',
        tags: ['Charity'],
      },
    ]
  },
  {
    id: 'about-to-graduate',
    title: 'About to Graduate',
    description: 'Pairs close to reaching graduation threshold',
    pairs: [
      {
        id: '4',
        name: 'Uxento Dislike Button',
        symbol: 'UX',
        address: '0xfedcba0987654321fedcba0987654321fedcba09',
        creator: '0x9c2d4f...',
        marketCap: 52000,
        price: 0.00052,
        volume24h: 64500,
        priceChange24h: 73,
        holders: 6,
        replies: 73,
        views: 0,
        graduationMcGoal: 69000,
        graduationProgress: 75,
        createdAt: new Date('2025-10-06T15:30:00Z'),
        status: 'about-to-graduate',
        chain: 'EVM',
        tags: ['Utility', 'Viral Post'],
      },
      {
        id: '5',
        name: 'Nutter Butter',
        symbol: 'NUTTER',
        address: '0x5555555555555555555555555555555555555555',
        creator: '0x4e3a7b...',
        marketCap: 42000,
        price: 0.00042,
        volume24h: 56600,
        priceChange24h: -20,
        holders: 200,
        replies: 4,
        views: 0,
        graduationMcGoal: 69000,
        graduationProgress: 61,
        createdAt: new Date('2025-10-06T14:00:00Z'),
        status: 'about-to-graduate',
        chain: 'EVM',
        tags: ['Meme'],
      },
      {
        id: '6',
        name: 'OVO',
        symbol: 'OVO',
        address: '0x6666666666666666666666666666666666666666',
        creator: '0x7a2c5e...',
        marketCap: 39000,
        price: 0.00039,
        volume24h: 55300,
        priceChange24h: 26,
        holders: 188,
        replies: 13,
        views: 0,
        graduationMcGoal: 69000,
        graduationProgress: 56,
        createdAt: new Date('2025-10-06T13:30:00Z'),
        status: 'about-to-graduate',
        chain: 'EVM',
        tags: ['Animal'],
      },
      {
        id: '21',
        name: 'Diamond Hands',
        symbol: 'DHAND',
        address: '0xffff2222aaaa3333bbbb4444cccc5555dddd6666',
        creator: '0x7c9e2a...',
        marketCap: 45000,
        price: 0.00045,
        volume24h: 58900,
        priceChange24h: 35,
        holders: 245,
        replies: 18,
        views: 102,
        graduationMcGoal: 69000,
        graduationProgress: 65,
        createdAt: new Date('2025-10-06T13:00:00Z'),
        status: 'about-to-graduate',
        chain: 'EVM',
        tags: ['Meme'],
      },
      {
        id: '22',
        name: 'Privacy Guard',
        symbol: 'PGUARD',
        address: '0xaaaa3333bbbb4444cccc5555dddd6666eeee7777',
        creator: '0x3f8d1b...',
        marketCap: 48000,
        price: 0.00048,
        volume24h: 61200,
        priceChange24h: -8,
        holders: 198,
        replies: 22,
        views: 87,
        graduationMcGoal: 69000,
        graduationProgress: 70,
        createdAt: new Date('2025-10-06T12:45:00Z'),
        status: 'about-to-graduate',
        chain: 'EVM',
        tags: ['Privacy'],
      },
      {
        id: '23',
        name: 'AI Brain',
        symbol: 'AIBR',
        address: '0xbbbb4444cccc5555dddd6666eeee7777ffff8888',
        creator: '0x9a2f3e...',
        marketCap: 51000,
        price: 0.00051,
        volume24h: 63800,
        priceChange24h: 42,
        holders: 312,
        replies: 29,
        views: 125,
        graduationMcGoal: 69000,
        graduationProgress: 74,
        createdAt: new Date('2025-10-06T12:30:00Z'),
        status: 'about-to-graduate',
        chain: 'EVM',
        tags: ['AI', 'Utility'],
      },
      {
        id: '24',
        name: 'Governance Plus',
        symbol: 'GPLUS',
        address: '0xcccc5555dddd6666eeee7777ffff8888aaaa9999',
        creator: '0x4e1c8d...',
        marketCap: 37000,
        price: 0.00037,
        volume24h: 52400,
        priceChange24h: 18,
        holders: 167,
        replies: 14,
        views: 74,
        graduationMcGoal: 69000,
        graduationProgress: 54,
        createdAt: new Date('2025-10-06T12:15:00Z'),
        status: 'about-to-graduate',
        chain: 'EVM',
        tags: ['Governance'],
      },
      {
        id: '25',
        name: 'Viral Rocket',
        symbol: 'VROCK',
        address: '0xdddd6666eeee7777ffff8888aaaa9999bbbb0000',
        creator: '0x6c3a9f...',
        marketCap: 54000,
        price: 0.00054,
        volume24h: 67200,
        priceChange24h: 88,
        holders: 421,
        replies: 35,
        views: 156,
        graduationMcGoal: 69000,
        graduationProgress: 78,
        createdAt: new Date('2025-10-06T12:00:00Z'),
        status: 'about-to-graduate',
        chain: 'EVM',
        tags: ['Viral Post'],
      },
      {
        id: '26',
        name: 'Charity World',
        symbol: 'CHWORLD',
        address: '0xeeee7777ffff8888aaaa9999bbbb0000cccc1111',
        creator: '0x8d2f7a...',
        marketCap: 41000,
        price: 0.00041,
        volume24h: 57100,
        priceChange24h: 12,
        holders: 189,
        replies: 16,
        views: 93,
        graduationMcGoal: 69000,
        graduationProgress: 59,
        createdAt: new Date('2025-10-06T11:45:00Z'),
        status: 'about-to-graduate',
        chain: 'EVM',
        tags: ['Charity'],
      },
      {
        id: '27',
        name: 'Beast Mode',
        symbol: 'BEAST',
        address: '0xffff8888aaaa9999bbbb0000cccc1111dddd2222',
        creator: '0x2a9e4c...',
        marketCap: 46000,
        price: 0.00046,
        volume24h: 59800,
        priceChange24h: -15,
        holders: 223,
        replies: 19,
        views: 108,
        graduationMcGoal: 69000,
        graduationProgress: 67,
        createdAt: new Date('2025-10-06T11:30:00Z'),
        status: 'about-to-graduate',
        chain: 'EVM',
        tags: ['Animal', 'Meme'],
      },
      {
        id: '28',
        name: 'Utility Max',
        symbol: 'UMAX',
        address: '0xaaaa9999bbbb0000cccc1111dddd2222eeee3333',
        creator: '0x7e3f1d...',
        marketCap: 43000,
        price: 0.00043,
        volume24h: 58200,
        priceChange24h: 28,
        holders: 207,
        replies: 21,
        views: 96,
        graduationMcGoal: 69000,
        graduationProgress: 62,
        createdAt: new Date('2025-10-06T11:15:00Z'),
        status: 'about-to-graduate',
        chain: 'EVM',
        tags: ['Utility'],
      },
      {
        id: '29',
        name: 'Moon Dog',
        symbol: 'MDOG',
        address: '0xbbbb0000cccc1111dddd2222eeee3333ffff4444',
        creator: '0x5f8c2a...',
        marketCap: 49000,
        price: 0.00049,
        volume24h: 62500,
        priceChange24h: 52,
        holders: 286,
        replies: 27,
        views: 134,
        graduationMcGoal: 69000,
        graduationProgress: 71,
        createdAt: new Date('2025-10-06T11:00:00Z'),
        status: 'about-to-graduate',
        chain: 'EVM',
        tags: ['Meme', 'Animal'],
      },
      {
        id: '30',
        name: 'Viral Wave',
        symbol: 'VWAVE',
        address: '0xcccc1111dddd2222eeee3333ffff4444aaaa5555',
        creator: '0x1d7e9a...',
        marketCap: 38000,
        price: 0.00038,
        volume24h: 53700,
        priceChange24h: -5,
        holders: 176,
        replies: 12,
        views: 82,
        graduationMcGoal: 69000,
        graduationProgress: 55,
        createdAt: new Date('2025-10-06T10:45:00Z'),
        status: 'about-to-graduate',
        chain: 'EVM',
        tags: ['Viral Post'],
      },
    ]
  },
  {
    id: 'graduated',
    title: 'Graduated',
    description: 'Successfully graduated pairs',
    pairs: [
      {
        id: '7',
        name: 'Froge Ask Froge',
        symbol: 'FROGE',
        address: '0x7777777777777777777777777777777777777777',
        creator: '0x1f8b3a...',
        marketCap: 257800,
        price: 0.002578,
        volume24h: 13000,
        priceChange24h: 29,
        holders: 65,
        replies: 0,
        views: 8,
        graduatedAt: new Date('2025-10-06T12:00:00Z'),
        createdAt: new Date('2025-10-06T10:00:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['Meme', 'Animal'],
        isVerified: true,
      },
      {
        id: '8',
        name: 'pumpball',
        symbol: 'PUMPBALL',
        address: '0x8888888888888888888888888888888888888888',
        creator: '0x2e4c9d...',
        marketCap: 95000,
        price: 0.00095,
        volume24h: 2900,
        priceChange24h: 10,
        holders: 1764,
        replies: 2,
        views: 0,
        graduatedAt: new Date('2025-10-06T11:30:00Z'),
        createdAt: new Date('2025-10-06T08:00:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['Utility'],
      },
      {
        id: '9',
        name: "Phantom's PHEMOJIS",
        symbol: 'PHEMO',
        address: '0x9999999999999999999999999999999999999999',
        creator: '0x5d7f2a...',
        marketCap: 295600,
        price: 0.002956,
        volume24h: 61500,
        priceChange24h: 20,
        holders: 369,
        replies: 0,
        views: 0,
        graduatedAt: new Date('2025-10-06T11:00:00Z'),
        createdAt: new Date('2025-10-06T07:30:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['Privacy', 'Governance'],
      },
      {
        id: '31',
        name: 'Super Shiba',
        symbol: 'SSHIBA',
        address: '0xdddd2222eeee3333ffff4444aaaa5555bbbb6666',
        creator: '0x9c7e3a...',
        marketCap: 185000,
        price: 0.00185,
        volume24h: 24500,
        priceChange24h: 42,
        holders: 892,
        replies: 34,
        views: 187,
        graduatedAt: new Date('2025-10-06T10:30:00Z'),
        createdAt: new Date('2025-10-06T06:00:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['Meme', 'Animal'],
      },
      {
        id: '32',
        name: 'AI Revolution',
        symbol: 'AIREV',
        address: '0xeeee3333ffff4444aaaa5555bbbb6666cccc7777',
        creator: '0x4f2e8d...',
        marketCap: 326000,
        price: 0.00326,
        volume24h: 71200,
        priceChange24h: 65,
        holders: 1243,
        replies: 52,
        views: 289,
        graduatedAt: new Date('2025-10-06T10:15:00Z'),
        createdAt: new Date('2025-10-06T05:30:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['AI'],
        isVerified: true,
      },
      {
        id: '33',
        name: 'Utility Hub',
        symbol: 'UHUB',
        address: '0xffff4444aaaa5555bbbb6666cccc7777dddd8888',
        creator: '0x7a9c3f...',
        marketCap: 142000,
        price: 0.00142,
        volume24h: 18900,
        priceChange24h: -12,
        holders: 634,
        replies: 28,
        views: 142,
        graduatedAt: new Date('2025-10-06T10:00:00Z'),
        createdAt: new Date('2025-10-06T05:00:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['Utility'],
      },
      {
        id: '34',
        name: 'Charity Moon',
        symbol: 'CHMOON',
        address: '0xaaaa5555bbbb6666cccc7777dddd8888eeee9999',
        creator: '0x3e8f1c...',
        marketCap: 98000,
        price: 0.00098,
        volume24h: 15600,
        priceChange24h: 18,
        holders: 521,
        replies: 19,
        views: 114,
        graduatedAt: new Date('2025-10-06T09:45:00Z'),
        createdAt: new Date('2025-10-06T04:30:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['Charity'],
      },
      {
        id: '35',
        name: 'Governance Pro',
        symbol: 'GPRO',
        address: '0xbbbb6666cccc7777dddd8888eeee9999ffff0000',
        creator: '0x6d2a9e...',
        marketCap: 167000,
        price: 0.00167,
        volume24h: 23400,
        priceChange24h: -8,
        holders: 743,
        replies: 31,
        views: 165,
        graduatedAt: new Date('2025-10-06T09:30:00Z'),
        createdAt: new Date('2025-10-06T04:00:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['Governance'],
      },
      {
        id: '36',
        name: 'Privacy Shield',
        symbol: 'PSHLD',
        address: '0xcccc7777dddd8888eeee9999ffff0000aaaa1111',
        creator: '0x8f3c7a...',
        marketCap: 213000,
        price: 0.00213,
        volume24h: 28700,
        priceChange24h: 35,
        holders: 967,
        replies: 41,
        views: 203,
        graduatedAt: new Date('2025-10-06T09:15:00Z'),
        createdAt: new Date('2025-10-06T03:30:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['Privacy'],
        isVerified: true,
      },
      {
        id: '37',
        name: 'Viral King',
        symbol: 'VKING',
        address: '0xdddd8888eeee9999ffff0000aaaa1111bbbb2222',
        creator: '0x2c9f4e...',
        marketCap: 376000,
        price: 0.00376,
        volume24h: 89200,
        priceChange24h: 112,
        holders: 1567,
        replies: 78,
        views: 412,
        graduatedAt: new Date('2025-10-06T09:00:00Z'),
        createdAt: new Date('2025-10-06T03:00:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['Viral Post'],
        isVerified: true,
      },
      {
        id: '38',
        name: 'Wild Cat',
        symbol: 'WCAT',
        address: '0xeeee9999ffff0000aaaa1111bbbb2222cccc3333',
        creator: '0x5e1d8a...',
        marketCap: 124000,
        price: 0.00124,
        volume24h: 17800,
        priceChange24h: 22,
        holders: 589,
        replies: 24,
        views: 136,
        graduatedAt: new Date('2025-10-06T08:45:00Z'),
        createdAt: new Date('2025-10-06T02:30:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['Animal'],
      },
      {
        id: '39',
        name: 'Meme Supreme',
        symbol: 'MSUP',
        address: '0xffff0000aaaa1111bbbb2222cccc3333dddd4444',
        creator: '0x7f4e2c...',
        marketCap: 289000,
        price: 0.00289,
        volume24h: 56300,
        priceChange24h: 58,
        holders: 1124,
        replies: 47,
        views: 267,
        graduatedAt: new Date('2025-10-06T08:30:00Z'),
        createdAt: new Date('2025-10-06T02:00:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['Meme'],
      },
      {
        id: '40',
        name: 'AI Genius',
        symbol: 'AIGEN',
        address: '0xaaaa1111bbbb2222cccc3333dddd4444eeee5555',
        creator: '0x9a7c3e...',
        marketCap: 198000,
        price: 0.00198,
        volume24h: 26400,
        priceChange24h: -15,
        holders: 834,
        replies: 36,
        views: 178,
        graduatedAt: new Date('2025-10-06T08:15:00Z'),
        createdAt: new Date('2025-10-06T01:30:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['AI', 'Utility'],
      },
      {
        id: '41',
        name: 'Rocket Doge',
        symbol: 'RDOGE',
        address: '0xbbbb2222cccc3333dddd4444eeee5555ffff6666',
        creator: '0x4c8e1f...',
        marketCap: 247000,
        price: 0.00247,
        volume24h: 38900,
        priceChange24h: 45,
        holders: 1043,
        replies: 42,
        views: 234,
        graduatedAt: new Date('2025-10-06T08:00:00Z'),
        createdAt: new Date('2025-10-06T01:00:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['Meme', 'Animal'],
      },
      {
        id: '42',
        name: 'Privacy Vault',
        symbol: 'PVAULT',
        address: '0xcccc3333dddd4444eeee5555ffff6666aaaa7777',
        creator: '0x6f3a2d...',
        marketCap: 156000,
        price: 0.00156,
        volume24h: 21100,
        priceChange24h: 12,
        holders: 687,
        replies: 29,
        views: 152,
        graduatedAt: new Date('2025-10-06T07:45:00Z'),
        createdAt: new Date('2025-10-06T00:30:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['Privacy', 'Governance'],
      },
      {
        id: '43',
        name: 'Charity Earth',
        symbol: 'CHEARTH',
        address: '0xdddd4444eeee5555ffff6666aaaa7777bbbb8888',
        creator: '0x8e2f9c...',
        marketCap: 109000,
        price: 0.00109,
        volume24h: 16700,
        priceChange24h: -6,
        holders: 542,
        replies: 21,
        views: 124,
        graduatedAt: new Date('2025-10-06T07:30:00Z'),
        createdAt: new Date('2025-10-05T23:30:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['Charity'],
      },
      {
        id: '44',
        name: 'Utility Network',
        symbol: 'UNET',
        address: '0xeeee5555ffff6666aaaa7777bbbb8888cccc9999',
        creator: '0x3d7e1a...',
        marketCap: 134000,
        price: 0.00134,
        volume24h: 19300,
        priceChange24h: 28,
        holders: 612,
        replies: 26,
        views: 145,
        graduatedAt: new Date('2025-10-06T07:15:00Z'),
        createdAt: new Date('2025-10-05T23:00:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['Utility'],
      },
      {
        id: '45',
        name: 'Viral Beast',
        symbol: 'VBEAST',
        address: '0xffff6666aaaa7777bbbb8888cccc9999dddd0000',
        creator: '0x7c9a4f...',
        marketCap: 312000,
        price: 0.00312,
        volume24h: 67800,
        priceChange24h: 85,
        holders: 1289,
        replies: 56,
        views: 298,
        graduatedAt: new Date('2025-10-06T07:00:00Z'),
        createdAt: new Date('2025-10-05T22:30:00Z'),
        status: 'graduated',
        chain: 'EVM',
        tags: ['Viral Post', 'Animal'],
      },
    ]
  }
];
*/

// Utility functions
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCompactCurrency = (num: number): string => {
  if (num >= 1e9) return "$" + (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return "$" + (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return "$" + (num / 1e3).toFixed(2) + "K";
  return USD.format(num);
};

const formatNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toString();
};

const formatPercent = (num: number | string | null | undefined): string => {
  const n = typeof num === 'number' ? num : num == null ? 0 : Number(num);
  const safe = Number.isFinite(n) ? n : 0;
  return (safe >= 0 ? '+' : '') + safe.toFixed(1) + '%';
};

const shortAddress = (address: string): string => {
  if (!address) return 'unknown';
  return address.slice(0, 6) + '...' + address.slice(-4);
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

const getTokenInitials = (symbol: string): string => {
  return symbol.slice(0, 2).toUpperCase();
};

// Map API Token to TokenPair for UI rendering
const tokenToPair = (t: Token, status: SectionType): TokenPair => {
  const marketCap = t.market_cap ? Number(t.market_cap) : 0;
  const volume24h = t.volume_24h ? Number(t.volume_24h) : 0;
  const createdAtMs = t.created_at_timestamp ? Number(t.created_at_timestamp) : Date.now();
  const graduationMcGoalRaw = (t as any).graduation_cap_norm ?? t.graduation_cap;
  const gradGoalNum = graduationMcGoalRaw ? Number(graduationMcGoalRaw) : undefined;
  return {
    id: t.token_address,
    name: t.name || t.symbol || 'Unknown',
    symbol: t.symbol || '',
    address: t.token_address,
    creator: (t as any).creator || '',
    marketCap,
    price: 0,
    volume24h,
    priceChange24h: Number(t.price_change_24h ?? 0),
    holders: 0,
    createdAt: new Date(createdAtMs),
    status,
    chain: 'EVM',
    graduationMcGoal: status === 'about-to-graduate' ? gradGoalNum : undefined,
    graduationProgress: (() => {
      if (status !== 'about-to-graduate') return undefined;
      const raw: any = (t as any).progress;
      const val = raw == null ? undefined : Number(raw);
      return Number.isFinite(val as number) ? (val as number) : undefined;
    })(),
  };
};

export const ExplorerWidget: React.FC<ExplorerWidgetProps> = ({
  isOpen,
  onClose,
  data,
  onPairClick,
}) => {
  const [state, setState] = useState<ExplorerWidgetState>({
    activeSection: 'newly-created',
    searchQuery: '',
    sortBy: 'recent',
    sortOrder: 'desc',
    filterChain: 'all',
  });

  // Search mode: 'token' address vs 'name'
  const [searchMode, setSearchMode] = useState<'token' | 'name'>('token');

  const router = useRouter();

  // Fetch data for sections
  const recent = useExplorerRecent({ pageSize: 20 });
  const nearly = useExplorerNearlyGraduated({ threshold: 80, pageSize: 25 });
  const graduated = useExplorerGraduated({ pageSize: 25 });

  const sectionsFromApi: ExplorerSection[] = useMemo(() => [
    {
      id: 'newly-created',
      title: 'Newly Created',
      description: 'Recently launched token pairs',
      pairs: (recent.data || []).map((t) => tokenToPair(t, 'newly-created')),
    },
    {
      id: 'about-to-graduate',
      title: 'About to Graduate',
      description: 'Pairs close to reaching graduation threshold',
      pairs: (nearly.data || []).map((t) => tokenToPair(t, 'about-to-graduate')),
    },
    {
      id: 'graduated',
      title: 'Graduated',
      description: 'Successfully graduated pairs',
      pairs: (graduated.data || []).map((t) => tokenToPair(t, 'graduated')),
    },
  ], [recent.data, nearly.data, graduated.data]);

  const explorerData = data || sectionsFromApi;
  const [filteredPairs, setFilteredPairs] = useState<TokenPair[]>([]);

  // Name search hook (debounced)
  const nameSearch = useNameSearch(state.searchQuery, {
    enabled: searchMode === 'name' && state.searchQuery.trim().length >= 2,
    pageSize: 10,
    debounceMs: 300,
  });

  const nameSearchPairs = useMemo(() =>
    (nameSearch.data || []).map((t) => tokenToPair(t, t.graduated ? 'graduated' : 'newly-created'))
  , [nameSearch.data]);

  // Search states
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<FullTokenDataResponse | null>(null);

  // Get current section
  const currentSection = explorerData.find(section => section.id === state.activeSection);

  // Apply filters and sorting
  const applyFiltersAndSort = useCallback(() => {
    if (!currentSection) return;

    let pairs = [...currentSection.pairs];

    // Apply search filter
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      pairs = pairs.filter(
        (pair) =>
          pair.name.toLowerCase().includes(query) ||
          pair.symbol.toLowerCase().includes(query) ||
          pair.address.toLowerCase().includes(query) ||
          pair.creator.toLowerCase().includes(query)
      );
    }

    // Apply chain filter
    if (state.filterChain && state.filterChain !== 'all') {
      pairs = pairs.filter(pair => pair.chain === state.filterChain);
    }

    // Apply sorting
    pairs.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (state.sortBy) {
        case 'marketcap':
          aValue = a.marketCap;
          bValue = b.marketCap;
          break;
        case 'volume':
          aValue = a.volume24h;
          bValue = b.volume24h;
          break;
        case 'holders':
          aValue = a.holders;
          bValue = b.holders;
          break;
        case 'recent':
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
      }

      if (state.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredPairs(pairs);
  }, [currentSection, state.searchQuery, state.filterChain, state.sortBy, state.sortOrder]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Event handlers
  const handleSectionChange = (section: SectionType) => {
    setState((prev) => ({ ...prev, activeSection: section }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setState((prev) => ({ ...prev, searchQuery: value }));
    if (searchMode === 'name') {
      const hasQuery = value.trim().length >= 2;
      setShowSearchResults(hasQuery);
    }
  };

  const submitSearch = useCallback(async () => {
    const raw = state.searchQuery.trim();
    if (!raw) return;

    // Validate and normalize address before calling the API
    const normalized = normalizeEthereumAddress(raw);
    setShowSearchResults(true);
    setSearchError(null);
    setSearchResult(null);

    if (!normalized) {
      setSearchError('Please enter a valid token address (0x followed by 40 hex characters).');
      return;
    }

    try {
      setSearchLoading(true);
      const res = await getFullTokenData(normalized);
      if ((res as any)?.error) {
        setSearchError((res as any).error || 'Token not found');
        setSearchResult(null);
      } else {
        setSearchResult(res);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch token';
      setSearchError(msg);
      setSearchResult(null);
    } finally {
      setSearchLoading(false);
    }
  }, [state.searchQuery]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void submitSearch();
    }
  };

  const clearSearchResults = () => {
    setShowSearchResults(false);
    setSearchLoading(false);
    setSearchError(null);
    setSearchResult(null);
  };

  const handleModeChange = (mode: 'token' | 'name') => {
    setSearchMode(mode);
    if (mode === 'name') {
      const q = state.searchQuery.trim();
      setShowSearchResults(q.length >= 2);
    } else {
      setShowSearchResults(false);
    }
  };

  // Map API FullTokenDataResponse to TokenPair for consistent UI card
  const fullToPair = useCallback((data: FullTokenDataResponse): TokenPair => {
    const t = data.tokenInfo;
    const marketCap = Number(data.marketCap) || 0;
    const vol = (() => {
      const last = data.lastTrade;
      if (!last) return 0;
      const v = typeof last.usdValue === 'string' ? parseFloat(String(last.usdValue).replace(/[^0-9.-]+/g, '')) : Number(last.usdValue || 0);
      return Number.isFinite(v) ? v : 0;
    })();
    const createdAtMs = Number(t.created_at_timestamp) || Date.now();
    const status: SectionType = t.graduated ? 'graduated' : 'newly-created';

    return {
      id: t.token_address,
      name: t.name || t.symbol || 'Unknown',
      symbol: t.symbol || '',
      address: t.token_address,
      creator: t.creator || '',
      marketCap,
      price: Number(data.price) || 0,
      volume24h: vol,
      priceChange24h: 0,
      holders: 0,
      createdAt: new Date(createdAtMs),
      status,
      chain: 'EVM',
      graduationMcGoal: undefined,
      graduationProgress: undefined,
      replies: undefined,
      views: undefined,
      likes: undefined,
      tags: t.catagory ? [t.catagory] : [],
    };
  }, []);

  const searchPair = useMemo(() => (searchResult ? fullToPair(searchResult) : null), [searchResult, fullToPair]);

  const handlePairClick = (pair: TokenPair) => {
    // Navigate to /trading-chart/[token] with the token address
    const target = `/trading-chart/${encodeURIComponent(pair.address)}`;
    router.push(target);

    // Preserve any additional click behavior provided by parent components
    if (onPairClick) {
      onPairClick(pair);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderLoading = (label = 'Loading...') => (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <Clock size={24} />
      </div>
      <div className={styles.emptyTitle}>{label}</div>
      <div className={styles.emptyMessage}>Fetching data from the network</div>
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <Flame size={28} />
      </div>
      <div className={styles.emptyTitle}>No Pairs Found</div>
      <div className={styles.emptyMessage}>
        {state.searchQuery
          ? 'No pairs match your search criteria.'
          : 'No pairs available in this section.'}
      </div>
    </div>
  );

  // Render pair card
  const renderPairCard = (pair: TokenPair) => (
    <div
      key={pair.id}
      className={styles.pairCard}
      onClick={() => handlePairClick(pair)}
    >
      {/* Pair Header */}
      <div className={styles.pairHeader}>
        <div className={styles.pairToken}>
          <div className={styles.tokenAvatar}>
            {getTokenInitials(pair.symbol)}
          </div>
          <div className={styles.tokenInfo}>
            <div className={styles.tokenName}>
              {pair.name}
              {pair.isVerified && (
                <span className={styles.verifiedBadge}>✓</span>
              )}
              {pair.hasWarning && (
                <AlertTriangle size={12} className={styles.warningIcon} />
              )}
            </div>
            <div className={styles.tokenMeta}>
              <span className={styles.tokenSymbol}>${pair.symbol}</span>
              <span className={styles.tokenChain}>{pair.chain}</span>
              <span className={styles.tokenTime}>{formatRelativeTime(pair.createdAt)}</span>
            </div>
          </div>
        </div>
        <div
          className={`${styles.priceChange} ${
            pair.priceChange24h >= 0 ? styles.positive : styles.negative
          }`}
        >
          {pair.priceChange24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {formatPercent(pair.priceChange24h)}
        </div>
      </div>

      {/* Pair Stats */}
      <div className={styles.pairStats}>
        <div className={styles.stat}>
          <div className={styles.statLabel}>MC</div>
          <div className={styles.statValue}>{formatCompactCurrency(pair.marketCap)}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Vol</div>
          <div className={styles.statValue}>{formatCompactCurrency(pair.volume24h)}</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Holders</div>
          <div className={styles.statValue}>{formatNumber(pair.holders)}</div>
        </div>
      </div>

      {/* Graduation Progress (for about-to-graduate) */}
      {pair.status === 'about-to-graduate' && pair.graduationProgress !== undefined && (
        <div className={styles.graduationSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>
              MC: {formatCompactCurrency(pair.marketCap)} / {formatCompactCurrency(pair.graduationMcGoal || 69000)}
            </span>
            <span className={styles.progressPercent}>{pair.graduationProgress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${pair.graduationProgress}%` }}
            />
          </div>
          <div className={styles.graduationNote}>
            {formatCompactCurrency((pair.graduationMcGoal || 69000) - pair.marketCap)} needed to graduate
          </div>
        </div>
      )}

      {/* Social Stats */}
      <div className={styles.socialStats}>
        {pair.replies !== undefined && (
          <div className={styles.socialStat}>
            <MessageCircle size={12} />
            <span>{pair.replies}</span>
          </div>
        )}
        {pair.views !== undefined && (
          <div className={styles.socialStat}>
            <Eye size={12} />
            <span>{pair.views}</span>
          </div>
        )}
        {pair.likes !== undefined && (
          <div className={styles.socialStat}>
            <ThumbsUp size={12} />
            <span>{pair.likes}</span>
          </div>
        )}
        <div className={styles.creator}>
          <span>by {shortAddress(pair.creator)}</span>
        </div>
      </div>

      {/* Tags */}
      {pair.tags && pair.tags.length > 0 && (
        <div className={styles.tags}>
          {pair.tags.map((tag, index) => (
            <span key={index} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  // Small pagination controls per section
  const SectionPagination: React.FC<{ id: SectionType }> = ({ id }) => {
    const pg = id === 'newly-created' ? recent : id === 'about-to-graduate' ? nearly : graduated;
    const isPrevDisabled = pg.page <= 1 || pg.isLoading;
    const isNextDisabled = !pg.hasMore || pg.isLoading;
    return (
      <div className={styles.paginationRow}>
        <button className={styles.pageButton} onClick={pg.prevPage} disabled={isPrevDisabled}>
          <ChevronLeft size={14} /> Prev
        </button>
        <div className={styles.pageInfo}>Page {pg.page}</div>
        <button className={styles.pageButton} onClick={pg.nextPage} disabled={isNextDisabled}>
          Next <ChevronRight size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className={`${styles.root} ${isOpen ? styles.open : ''}`}>
      <div className={styles.overlay} onClick={handleOverlayClick} />

      <div className={styles.panel}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.icon}>
              <Flame size={18} />
            </div>
            <div className={styles.titleBlock}>
              <h2 className={styles.title}>Token Explorer</h2>
              <div className={styles.sub}>Discover new token pairs</div>
            </div>
          </div>

          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close explorer widget"
          >
            <X size={18} />
          </button>
        </header>

        {/* Section Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${state.activeSection === 'newly-created' ? styles.active : ''}`}
              onClick={() => handleSectionChange('newly-created')}
            >
              <Flame size={16} /> Newly Created
            </button>
            <button
              className={`${styles.tab} ${state.activeSection === 'about-to-graduate' ? styles.active : ''}`}
              onClick={() => handleSectionChange('about-to-graduate')}
            >
              <Clock size={16} /> About to Graduate
            </button>
            <button
              className={`${styles.tab} ${state.activeSection === 'graduated' ? styles.active : ''}`}
              onClick={() => handleSectionChange('graduated')}
            >
              <Award size={16} /> Graduated
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={styles.controls}>
          <div className={styles.searchBar}>
            <div className={styles.modeToggle} role="tablist" aria-label="Search mode">
              <button
                className={`${styles.modeBtn} ${searchMode === 'token' ? styles.active : ''}`}
                onClick={() => handleModeChange('token')}
                aria-label="Search by token address"
                aria-pressed={searchMode === 'token'}
                title="Search by token address"
              >
                <Hash size={14} />
              </button>
              <button
                className={`${styles.modeBtn} ${searchMode === 'name' ? styles.active : ''}`}
                onClick={() => handleModeChange('name')}
                aria-label="Search by token name"
                aria-pressed={searchMode === 'name'}
                title="Search by token name"
              >
                <Type size={14} />
              </button>
            </div>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={searchMode === 'name' ? 'Search by name…' : 'Search by address…'}
              value={state.searchQuery}
              onChange={handleSearch}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search by token name, symbol, or address"
            />
            <button
              className={styles.searchBtn}
              onClick={() => void submitSearch()}
              disabled={searchLoading || !state.searchQuery.trim()}
              aria-label="Search token"
              title="Search token"
            >
              <Search size={14} />
            </button>
          </div>
        </div>

        {/* Section Description (Mobile Only) */}
        {currentSection && (
          <div className={styles.sectionDescription}>
            {currentSection.description}
          </div>
        )}

        {/* Search Results (if any) */}
        {showSearchResults && (
          <div className={styles.searchResults}>
            <div className={styles.resultsHeader}>
              <div className={styles.resultsTitle}>Search Results :</div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className={styles.pageButton} onClick={clearSearchResults} aria-label="Close results" title="Close results">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className={styles.resultsBody}>
              {searchMode === 'token' ? (
                searchLoading ? (
                  renderLoading('Searching...')
                ) : searchError ? (
                  <div className={styles.errorBox} role="alert">
                    {searchError}
                  </div>
                ) : searchPair ? (
                  <div className={styles.pairsList}>
                    {renderPairCard(searchPair)}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <AlertTriangle size={24} />
                    </div>
                    <div className={styles.emptyTitle}>No results</div>
                    <div className={styles.emptyMessage}>Try another token address.</div>
                  </div>
                )
              ) : (
                nameSearch.isLoading ? (
                  renderLoading('Searching...')
                ) : nameSearch.error ? (
                  <div className={styles.errorBox} role="alert">
                    {nameSearch.error.message}
                  </div>
                ) : nameSearchPairs.length > 0 ? (
                  <div className={styles.pairsList}>
                    {nameSearchPairs.map((pair) => renderPairCard(pair))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <AlertTriangle size={24} />
                    </div>
                    <div className={styles.emptyTitle}>No results</div>
                    <div className={styles.emptyMessage}>Try another name.</div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Desktop: Three Column Layout */}
        {!showSearchResults && (
          <div className={styles.sectionsContainer}>
          {[
            { section: explorerData[0], id: 'newly-created' as SectionType, loading: recent.isLoading },
            { section: explorerData[1], id: 'about-to-graduate' as SectionType, loading: nearly.isLoading },
            { section: explorerData[2], id: 'graduated' as SectionType, loading: graduated.isLoading },
          ].map(({ section, id, loading }) => (
            <div key={id} className={styles.sectionColumn}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  {id === 'newly-created' && <Flame size={18} />}
                  {id === 'about-to-graduate' && <Clock size={18} />}
                  {id === 'graduated' && <Award size={18} />}
                  {section?.title}
                </div>
                <div className={styles.sectionDescription}>
                  {section?.description}
                </div>
                <SectionPagination id={id} />
              </div>
              <div className={styles.sectionContent}>
                {loading ? (
                  renderLoading()
                ) : !section || section.pairs.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <Flame size={24} />
                    </div>
                    <div className={styles.emptyTitle}>No Pairs</div>
                    <div className={styles.emptyMessage}>
                      No pairs in this section yet.
                    </div>
                  </div>
                ) : (
                  <div className={styles.pairsList}>
                    {section.pairs.map((pair) => renderPairCard(pair))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Mobile: Single Content with Tabs */}
        {!showSearchResults && (
        <div className={styles.mobileContent}>
          {(() => {
            const mobileLoading = state.activeSection === 'newly-created' ? recent.isLoading : state.activeSection === 'about-to-graduate' ? nearly.isLoading : graduated.isLoading;
            if (mobileLoading) return renderLoading();
            return filteredPairs.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className={styles.pairsList}>
                {filteredPairs.map((pair) => renderPairCard(pair))}
                <SectionPagination id={state.activeSection} />
              </div>
            );
          })()}
        </div>
        )}
      </div>
    </div>
  );
};
