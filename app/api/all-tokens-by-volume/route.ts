import { NextResponse } from 'next/server';
import { mockTokens } from '../mockData';

export async function GET() {
  try {
    console.log('API all-tokens-by-volume called');
    
    // Sort tokens by 24h volume in descending order
    const tokensSortedByVolume = [...mockTokens].sort((a, b) => {
      const aVolume = a.volume_24h || 0;
      const bVolume = b.volume_24h || 0;
      return bVolume - aVolume;
    });
    
    return NextResponse.json(tokensSortedByVolume);
  } catch (error) {
    console.error('Error in all-tokens-by-volume API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
