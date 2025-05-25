export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  metadata: {
    page: number;
    limit: number;
    total: number;
  };
}

export type ApiError = {
  message: string;
  code?: string;
  details?: unknown;
}; 