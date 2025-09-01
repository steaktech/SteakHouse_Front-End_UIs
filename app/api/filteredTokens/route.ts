import { NextRequest, NextResponse } from 'next/server';
import type { Token } from '@/app/types/token';
import { mockTokens } from '../mockData';

export async function GET(request: NextRequest) {
  console.log('=== filteredTokens API called ===');
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const sortBy = searchParams.get('sortBy') || 'mcap';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const tokenType = searchParams.get('tokenType');
    const graduated = searchParams.get('graduated');
    const minMarketCap = searchParams.get('minMarketCap');
    const maxMarketCap = searchParams.get('maxMarketCap');

    console.log('API filteredTokens called with params:', {
      sortBy,
      sortOrder,
      limit,
      tokenType,
      graduated,
      minMarketCap,
      maxMarketCap
    });

    // Start with all mock tokens
    let filteredTokens = [...mockTokens];

    // Apply filters
    if (tokenType) {
      const typeNumber = parseInt(tokenType);
      filteredTokens = filteredTokens.filter(token => token.token_type === typeNumber);
    }

    if (graduated !== null && graduated !== undefined) {
      const isGraduated = graduated === 'true';
      filteredTokens = filteredTokens.filter(token => token.graduated === isGraduated);
    }

    if (minMarketCap) {
      const minCap = parseFloat(minMarketCap);
      filteredTokens = filteredTokens.filter(token => parseFloat(token.market_cap) >= minCap);
    }

    if (maxMarketCap) {
      const maxCap = parseFloat(maxMarketCap);
      filteredTokens = filteredTokens.filter(token => parseFloat(token.market_cap) <= maxCap);
    }

    // Apply sorting
    filteredTokens.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'mcap':
          aValue = parseFloat(a.market_cap);
          bValue = parseFloat(b.market_cap);
          break;
        case 'volume':
          aValue = a.volume_24h || 0;
          bValue = b.volume_24h || 0;
          break;
        case 'age':
          aValue = parseFloat(a.age_hours);
          bValue = parseFloat(b.age_hours);
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          aValue = parseFloat(a.market_cap);
          bValue = parseFloat(b.market_cap);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply limit
    const limitedTokens = filteredTokens.slice(0, limit);

    console.log(`Returning ${limitedTokens.length} tokens (filtered from ${mockTokens.length})`);
    console.log('Sample token:', limitedTokens[0] ? {
      name: limitedTokens[0].name,
      symbol: limitedTokens[0].symbol,
      token_type: limitedTokens[0].token_type,
      market_cap: limitedTokens[0].market_cap
    } : 'No tokens');

    const response = NextResponse.json(limitedTokens);
    console.log('Response created successfully');
    return response;
  } catch (error) {
    console.error('Error in filteredTokens API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
