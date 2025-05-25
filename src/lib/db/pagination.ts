import { sql } from 'drizzle-orm';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export function getPaginationOffset({ page, limit }: PaginationParams): number {
  return (page - 1) * limit;
}

export function createPaginationQuery(
  baseQuery: string,
  { page, limit }: PaginationParams
): string {
  const offset = getPaginationOffset({ page, limit });
  return `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
}

export function createCountQuery(baseQuery: string): string {
  return `SELECT COUNT(*) FROM (${baseQuery}) as count_query`;
}

export function formatPaginatedResult<T>(
  data: T[],
  total: number,
  { page, limit }: PaginationParams
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
} 