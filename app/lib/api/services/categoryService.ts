// lib/api/services/categoryService.ts
import { apiClient } from '../client';
import type { PaginatedTokenResponse } from '@/app/types/token';

/**
 * Valid category values for the category API endpoint
 */
export type CategoryType = 'meme' | 'ai' | 'utility' | 'x-post';

/**
 * Valid sort options for the category API endpoint
 */
export type CategorySortBy = 
  | 'inserted_at' 
  | 'updated_at' 
  | 'created_at_timestamp' 
  | 'graduation_timestamp' 
  | 'circulating_supply' 
  | 'eth_pool' 
  | 'name' 
  | 'symbol';

/**
 * Parameters for the category API endpoint
 */
export interface CategoryParams {
  page?: number;
  pageSize?: number;
  sortBy?: CategorySortBy;
}

/**
 * Fetches tokens by category with optional pagination and sorting.
 * 
 * @param category - The category to filter by ('meme', 'ai', 'utility')
 * @param params - Optional parameters for pagination and sorting
 * @returns Promise<PaginatedTokenResponse> - Paginated response with tokens
 * 
 * GET /api/category/:category
 */
export async function getTokensByCategory(
  category: CategoryType, 
  params?: CategoryParams
): Promise<PaginatedTokenResponse> {
  // Build query parameters
  const searchParams = new URLSearchParams();
  
  if (params?.page) {
    searchParams.append('page', params.page.toString());
  }
  
  if (params?.pageSize) {
    searchParams.append('pageSize', params.pageSize.toString());
  }
  
  if (params?.sortBy) {
    searchParams.append('sortBy', params.sortBy);
  }
  
  // Construct the URL with category and query parameters
  const queryString = searchParams.toString();
  const endpoint = `/catagory/${category}${queryString ? `?${queryString}` : ''}`;
  
  return apiClient<PaginatedTokenResponse>(endpoint);
}

/**
 * Helper function to validate if a string is a valid category type
 */
export function isValidCategory(category: string): category is CategoryType {
  return ['meme', 'ai', 'utility', 'x-post'].includes(category);
}

/**
 * Helper function to validate if a string is a valid sort option
 */
export function isValidCategorySortBy(sortBy: string): sortBy is CategorySortBy {
  return [
    'inserted_at',
    'updated_at', 
    'created_at_timestamp',
    'graduation_timestamp',
    'circulating_supply',
    'eth_pool',
    'name',
    'symbol'
  ].includes(sortBy);
}
