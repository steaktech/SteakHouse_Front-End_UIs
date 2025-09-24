# SteakHouse Front-End Setup Guide

This document explains how to set up the experimental branch to work out of the box after cloning.

## Problem Solved

The experimental branch was throwing `"Failed to load tokens - API call to /filteredTokens?sortBy=mcap&sortOrder=desc&limit=20 failed: Not Found"` errors because the API client was not properly configured to use the local Next.js API routes.

## Solution

The repository now includes:

1. **Environment Configuration** (`.env.local`):
   ```bash
   NEXT_PUBLIC_API_BASE_URL=/api
   ```
   This configures the API client to use local Next.js API routes instead of trying to connect to an external backend.

2. **Local API Routes** (`app/api/`):
   - `/api/filteredTokens` - Returns filtered token data with sorting and pagination
   - `/api/all-tokens` - Returns all tokens
   - `/api/all-tokens-by-volume` - Returns tokens sorted by volume
   
3. **Mock Data** (`app/api/mockData.ts`):
   - Contains sample token data with proper typing
   - Includes various token types (Meme, Utility, AI, X-post)
   - Realistic market cap, volume, and other trading data

## Quick Start

After cloning this repository:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal)

The application should now load successfully with token data displayed!

## What Works Out of the Box

- ✅ Token dashboard loads with sample data
- ✅ Filtering and sorting functionality
- ✅ All API endpoints respond correctly
- ✅ Mock data includes realistic trading metrics
- ✅ Responsive design and UI components

## API Endpoints Available

All endpoints work locally and return proper JSON responses:

- `GET /api/filteredTokens?sortBy=mcap&sortOrder=desc&limit=20` - Filtered tokens
- `GET /api/all-tokens` - All tokens
- `GET /api/all-tokens-by-volume` - Tokens by volume

## Configuration for Different Environments

### Local Development (Default)
```bash
NEXT_PUBLIC_API_BASE_URL=/api
```

### External Backend
If you want to connect to an external backend later:
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-server.com/api
```

### Localhost with Port
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## Notes

- The token images reference files in `/public/images/tokens/` that don't exist, so you'll see 404s for images
- This doesn't affect functionality - the app works perfectly for development and testing
- All core features (filtering, sorting, displaying tokens) work correctly
- The wallet connection features use WalletConnect and may show warnings in development (this is normal)

## Architecture

The setup uses Next.js API routes as a local backend:
- **Frontend**: React components in `app/components/`
- **API Layer**: `app/lib/api/services/` contains service functions
- **Mock Backend**: `app/api/` contains Next.js API route handlers
- **Types**: `app/types/` contains TypeScript type definitions
- **State Management**: React hooks in `app/hooks/`

This architecture allows for easy development and testing while maintaining the same API interface that would be used with a real backend.
