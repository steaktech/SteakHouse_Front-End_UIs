import { apiClient } from '@/app/lib/api/client';
import type { PaginatedTokenResponse } from '@/app/types/token';

export interface RecentParams {
  page?: number;
  pageSize?: number; // maps to page_size for this endpoint
}

export interface GraduatedParams {
  page?: number;
  pageSize?: number;
  threshold?: number; // percentage 0-100; if provided, returns tokens at threshold or higher
}

export class ExplorerService {
  static async getRecentTokens(params: RecentParams = {}): Promise<PaginatedTokenResponse> {
    const search = new URLSearchParams();
    if (params.page) search.append('page', String(params.page));
    if (params.pageSize) search.append('page_size', String(params.pageSize));
    // Endpoint uses page_size per user spec
    const qs = search.toString();
    return apiClient<PaginatedTokenResponse>(`/filtered/recent${qs ? `?${qs}` : ''}`);
  }

  static async getGraduatedTokens(params: GraduatedParams = {}): Promise<PaginatedTokenResponse> {
    const search = new URLSearchParams();
    if (params.page) search.append('page', String(params.page));
    if (params.pageSize) search.append('pageSize', String(params.pageSize));
    if (params.threshold !== undefined) search.append('threshold', String(params.threshold));
    const qs = search.toString();
    return apiClient<PaginatedTokenResponse>(`/tokens/graduated${qs ? `?${qs}` : ''}`);
  }
}
