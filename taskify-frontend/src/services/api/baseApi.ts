import { API_CONFIG } from '../../config/api';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
  timestamp: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export class BaseApiService {
  protected baseUrl = API_CONFIG.BASE_URL;

  protected async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          // Remove authentication headers for now
          ...options?.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.title || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {
          success: true,
          message: 'Success',
          data: {} as T,
          errors: [],
          timestamp: new Date().toISOString()
        };
      }

      const result = await response.json();
      
      // Check if the response is already in ApiResponse format
      if (result && typeof result === 'object' && 'success' in result) {
        return result;
      }
      
      // Wrap raw response in ApiResponse format
      return {
        success: true,
        message: 'Success',
        data: result as T,
        errors: [],
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      
      throw new Error('An unexpected error occurred');
    }
  }

  protected async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.fetchApi<T>(endpoint, {
      method: 'GET',
    });
  }

  protected async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.fetchApi<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.fetchApi<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.fetchApi<T>(endpoint, {
      method: 'DELETE',
    });
  }

  protected buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }
}
