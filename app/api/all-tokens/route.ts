import { NextResponse } from 'next/server';
import { mockTokens } from '../mockData';

export async function GET() {
  try {
    console.log('API all-tokens called');
    return NextResponse.json(mockTokens);
  } catch (error) {
    console.error('Error in all-tokens API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
