import type {
    ApiResponse,
    CoinGeckoResponse,
    CryptoSymbol,
    PriceData,
    TimePeriod
} from '../types.js';
import { HttpClient } from './http-client.js';

export class CoinGeckoProvider {
  private readonly httpClient: HttpClient;
  private readonly rateLimitDelay = 1100; // 1.1 secondes pour respecter les limites
  private lastRequestTime = 0;

  constructor() {
    this.httpClient = new HttpClient('https://api.coingecko.com/api/v3');
  }

  getName(): string {
    return 'CoinGecko';
  }

  async fetchPriceData(
    symbol: CryptoSymbol,
    period: TimePeriod
  ): Promise<ApiResponse<PriceData[]>> {
    await this.enforceRateLimit();

    try {
      const days = this.getDaysFromPeriod(period);
      const interval = this.getInterval(period);
      
      const params = {
        vs_currency: 'usd',
        days: days,
        interval,
      };

      const response = await this.httpClient.get<CoinGeckoResponse>(
        `/coins/${symbol}/market_chart`,
        params
      );

      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || 'Failed to fetch data from CoinGecko',
        };
      }

      const { prices } = response.data;
      
      if (!Array.isArray(prices) || prices.length === 0) {
        return {
          success: false,
          error: 'No price data available',
        };
      }

      const priceData: PriceData[] = prices.map(([timestamp, price]) => ({
        timestamp,
        price,
      }));

      if (!this.validatePriceData(priceData)) {
        return {
          success: false,
          error: 'Invalid price data received',
        };
      }

      return {
        success: true,
        data: priceData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  private getDaysFromPeriod(period: TimePeriod): number {
    switch (period) {
      case '1d':
        return 1;
      case '30d':
        return 30;
      case '365d':
        return 365;
      default:
        throw new Error(`Unsupported period: ${period}`);
    }
  }

  private getInterval(period: TimePeriod): string {
    switch (period) {
      case '1d':
        return 'hourly';
      case '30d':
        return 'daily';
      case '365d':
        return 'daily';
      default:
        return 'daily';
    }
  }

  private validatePriceData(data: readonly PriceData[]): boolean {
    return (
      data.length > 1 &&
      data.every(
        item =>
          typeof item.price === 'number' &&
          typeof item.timestamp === 'number' &&
          !Number.isNaN(item.price) &&
          item.price > 0 &&
          item.timestamp > 0
      )
    );
  }
}
