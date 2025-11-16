import { request } from 'undici';
import type { ApiResponse } from '../types.js';

export class HttpClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeout: number;

  constructor(baseUrl: string, timeout: number = 10000) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.timeout = timeout;
    this.defaultHeaders = {
      'User-Agent': 'crypto-volatility/1.0.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number>
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint, params);
      
      const { statusCode, headers, body } = await request(url, {
        method: 'GET',
        headers: this.defaultHeaders,
        headersTimeout: this.timeout,
        bodyTimeout: this.timeout,
      });

      if (statusCode < 200 || statusCode >= 300) {
        return {
          success: false,
          error: `HTTP ${statusCode}: Request failed`,
          statusCode,
        };
      }

      const contentType = headers['content-type'] as string;
      if (!contentType?.includes('application/json')) {
        return {
          success: false,
          error: 'Invalid content type, expected JSON',
          statusCode,
        };
      }

      const responseText = await body.text();
      const data = JSON.parse(responseText) as T;

      return {
        success: true,
        data,
        statusCode,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number>): string {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }
}
