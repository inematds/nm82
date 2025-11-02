/**
 * Shared type definitions for the monorepo
 */

export type AppEnvironment = 'development' | 'staging' | 'production';

export interface AppConfig {
  environment: AppEnvironment;
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
