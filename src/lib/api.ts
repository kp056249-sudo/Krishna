/**
 * DataNexus Enterprise Typed API Client
 * Retrieves Supabase session access_token or cached token for Bearer authentication.
 */
import { supabase } from './supabase';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  [key: string]: any;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: any;
  skipAuth?: boolean;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Retrieves the current user's Supabase access token or fallback cached token.
   */
  public async getAuthToken(): Promise<string | null> {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        localStorage.setItem('datanexus_id_token', data.session.access_token);
        return data.session.access_token;
      }
    } catch (err) {
      // Non-blocking fallback
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('datanexus_id_token');
    }
    return null;
  }

  /**
   * Builds the default headers including content type and Bearer token.
   */
  private async getHeaders(options?: RequestOptions): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    };

    if (!options?.skipAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Formats a URL with optional query parameters.
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = this.baseUrl ? `${this.baseUrl}${cleanEndpoint}` : cleanEndpoint;

    if (!params) return fullUrl;

    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });

    const queryString = query.toString();
    return queryString ? `${fullUrl}?${queryString}` : fullUrl;
  }

  /**
   * Performs an HTTP request and parses JSON response with uniform error trapping.
   */
  private async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint, options.params);
      const headers = await this.getHeaders(options);

      const fetchConfig: RequestInit = {
        method,
        headers,
        ...options,
      };

      if (options.body !== undefined && method !== 'GET' && method !== 'DELETE') {
        fetchConfig.body = typeof options.body === 'string' 
          ? options.body 
          : JSON.stringify(options.body);
      }

      const res = await fetch(url, fetchConfig);
      
      let json: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        json = await res.json().catch(() => ({}));
      } else {
        const text = await res.text().catch(() => '');
        json = { data: text };
      }

      if (!res.ok) {
        const errorDetail = json.error || json.message || (typeof json.data === 'string' && json.data.trim().length > 0 ? json.data : null) || (res.statusText ? res.statusText : 'Request rejected by server');
        return {
          success: false,
          error: `HTTP ${res.status}: ${errorDetail}`,
          status: res.status,
          ...json,
        };
      }

      return {
        success: true,
        ...(typeof json === 'object' && json !== null ? json : { data: json }),
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network communication error',
      };
    }
  }

  public get<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, options);
  }

  public post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, { ...options, body });
  }

  public put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, { ...options, body });
  }

  public patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, { ...options, body });
  }

  public delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, options);
  }
}

export const api = new ApiClient();
export default api;
