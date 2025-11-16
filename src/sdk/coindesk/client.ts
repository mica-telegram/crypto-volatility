/**
 * CoinDesk /index/cc/v1 SDK Client
 * Provides typed access to CoinDesk index endpoints
 */

import type {
    ErrorResponse,
    FuturesFundingResponse,
    FuturesInstrumentMetadataResponse,
    // futures types
    FuturesLatestParams,
    FuturesLatestTickResponse,
    FuturesOpenInterestResponse,
    FuturesOrderBookParams,
    FuturesOrderBookResponse,
    HistoricalOHLCVResponse,
    HistoricalParams,
    InstrumentMetadataParams,
    InstrumentMetadataResponse,
    LatestTickParams,
    LatestTickResponse,
    Market,
    MarketInstrumentsResponse,
    MarketsParams,
    MarketsResponse,
    SDKOptions,
    // spot types
    SpotInstrumentMetadataResponse,
    SpotLatestTickParams,
    SpotLatestTickResponse,
    SpotMarketInstrumentsResponse,
    SpotMarketsResponse,
    SpotOrderBookParams,
    SpotOrderBookResponse
} from './types';

const DEFAULT_BASE = 'https://data-api.cryptocompare.com';
const DEFAULT_TIMEOUT = 10000;

export class CoinDeskSDK {
  readonly baseUrl: string;
  readonly apiKey?: string | undefined;
  readonly apiKeyHeader: string;
  readonly timeout: number;

  constructor(opts?: SDKOptions) {
    this.baseUrl = opts?.baseUrl ?? DEFAULT_BASE;
    const key = opts?.apiKey ?? process.env.COINDESK_API_KEY;
    this.apiKey = key ? String(key) : undefined;
    this.apiKeyHeader = opts?.apiKeyHeader ?? 'api_key';
    this.timeout = DEFAULT_TIMEOUT;
  }

  /**
   * Generic helper to call any /futures/v1/latest/* endpoint
   */
  async fetchFuturesLatest<T = any>(pathSuffix: string, params: Record<string, any> = {}): Promise<T> {
    const path = `/futures/v1/latest/${pathSuffix.replace(/^\//, '')}`;
    return this.fetch<T>(path, params);
  }

  /**
   * Get latest tick data for futures markets
   * Endpoint: GET /futures/v1/latest/tick
   */
  async getFuturesLatestTick(params: FuturesLatestParams): Promise<FuturesLatestTickResponse> {
    return this.fetchFuturesLatest<FuturesLatestTickResponse>('tick', {
      market: params.market,
      instruments: params.instruments?.join(','),
      groups: params.groups?.join(','),
      apply_mapping: params.apply_mapping ?? true,
      response_format: params.response_format ?? 'JSON',
    });
  }

  /**
   * Get futures instrument metadata
   * Endpoint: GET /futures/v1/latest/instrument/metadata
   */
  async getFuturesInstrumentMetadata(params: { market: string; instruments?: string[]; groups?: string[] }): Promise<FuturesInstrumentMetadataResponse> {
    return this.fetchFuturesLatest<FuturesInstrumentMetadataResponse>('instrument/metadata', {
      market: params.market,
      instruments: params.instruments?.join(','),
      groups: params.groups?.join(','),
    });
  }

  /**
   * Get latest open interest for futures
   * Endpoint: GET /futures/v1/latest/open_interest
   */
  async getFuturesLatestOpenInterest(params: { market: string; instruments?: string[]; groups?: string[] }): Promise<FuturesOpenInterestResponse> {
    return this.fetchFuturesLatest<FuturesOpenInterestResponse>('open_interest', {
      market: params.market,
      instruments: params.instruments?.join(','),
      groups: params.groups?.join(','),
    });
  }

  /**
   * Get latest funding rates for futures
   * Endpoint: GET /futures/v1/latest/funding
   */
  async getFuturesLatestFunding(params: { market: string; instruments?: string[]; groups?: string[] }): Promise<FuturesFundingResponse> {
    return this.fetchFuturesLatest<FuturesFundingResponse>('funding', {
      market: params.market,
      instruments: params.instruments?.join(','),
      groups: params.groups?.join(','),
    });
  }

  /**
   * Get latest orderbook snapshot for futures
   * Endpoint: GET /futures/v1/latest/orderbook
   */
  async getFuturesLatestOrderBook(params: FuturesOrderBookParams): Promise<FuturesOrderBookResponse> {
    return this.fetchFuturesLatest<FuturesOrderBookResponse>('orderbook', {
      market: params.market,
      instrument: params.instrument,
      depth: params.depth,
    });
  }
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers[this.apiKeyHeader] = this.apiKey;
    }
    return headers;
  }

  /**
   * Generic helper to call any /spot/v1/latest/* endpoint
   */
  async fetchSpotLatest<T = any>(pathSuffix: string, params: Record<string, any> = {}): Promise<T> {
    const path = `/spot/v1/latest/${pathSuffix.replace(/^\//, '')}`;
    return this.fetch<T>(path, params);
  }

  /**
   * Get latest tick data for spot markets
   * Endpoint: GET /spot/v1/latest/tick
   */
  async getSpotLatestTick(params: SpotLatestTickParams): Promise<SpotLatestTickResponse> {
    return this.fetchSpotLatest<SpotLatestTickResponse>('tick', {
      market: params.market,
      instruments: params.instruments?.join(','),
      groups: params.groups?.join(','),
      apply_mapping: params.apply_mapping ?? true,
      response_format: params.response_format ?? 'JSON',
    });
  }

  /**
   * Get latest instrument metadata for spot
   * Endpoint: GET /spot/v1/latest/instrument/metadata
   */
  async getSpotInstrumentMetadata(params: { market: string; instruments?: string[]; groups?: string[] }): Promise<SpotInstrumentMetadataResponse> {
    return this.fetchSpotLatest<SpotInstrumentMetadataResponse>('instrument/metadata', {
      market: params.market,
      instruments: params.instruments?.join(','),
      groups: params.groups?.join(','),
    });
  }

  /**
   * Get latest order book (L2 metrics / snapshot)
   * Endpoint: GET /spot/v1/latest/orderbook
   */
  async getSpotLatestOrderBook(params: SpotOrderBookParams): Promise<SpotOrderBookResponse> {
    return this.fetchSpotLatest<SpotOrderBookResponse>('orderbook', {
      market: params.market,
      instrument: params.instrument,
      depth: params.depth,
      response_format: params.response_format ?? 'JSON',
    });
  }

  /**
   * Get spot markets list (latest)
   * Endpoint: GET /spot/v1/latest/markets
   */
  async getSpotMarkets(params?: { market?: string; groups?: string[] }): Promise<SpotMarketsResponse> {
    return this.fetchSpotLatest<SpotMarketsResponse>('markets', {
      market: params?.market,
      groups: params?.groups?.join(','),
    });
  }

  /**
   * Get spot markets with instruments
   * Endpoint: GET /spot/v1/latest/markets/instruments
   */
  async getSpotMarketInstruments(params?: { market?: string; groups?: string[] }): Promise<SpotMarketInstrumentsResponse> {
    return this.fetchSpotLatest<SpotMarketInstrumentsResponse>('markets/instruments', {
      market: params?.market,
      groups: params?.groups?.join(','),
    });
  }

  private buildUrl(path: string, params: Record<string, any> = {}): URL {
    const url = new URL(path, this.baseUrl);
    
    // Add API key as query param if not using header
    if (this.apiKey) {
      url.searchParams.append(this.apiKeyHeader, this.apiKey);
    }

    // Add other params
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          url.searchParams.append(key, value.join(','));
        } else {
          url.searchParams.append(key, String(value));
        }
      }
    }

    return url;
  }

  private async fetch<T>(
    path: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    const url = this.buildUrl(path, params);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(url.toString(), {
        headers: this.buildHeaders(),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = (await res.json()) as ErrorResponse;
        throw new Error(
          `CoinDesk API error ${res.status}: ${err.message || err.error || res.statusText}`
        );
      }
      const T1 =  (await res.json()) as T
      return T1;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get the latest tick data for one or more index instruments.
   * Endpoint: GET /index/cc/v1/latest/tick
   */
  async getLatestTick(params: LatestTickParams): Promise<LatestTickResponse> {
    return this.fetch('/index/cc/v1/latest/tick', {
      market: params.market,
      instruments: params.instruments?.join(','),
      groups: params.groups?.join(','),
      apply_mapping: params.apply_mapping ?? true,
    });
  }

  /**
   * Get historical OHLCV+ data at day resolution.
   * Endpoint: GET /index/cc/v1/historical/days
   */
  async getHistoricalDays(params: HistoricalParams): Promise<HistoricalOHLCVResponse> {
    return this.fetch('/index/cc/v1/historical/days', {
      market: params.market,
      instrument: params.instrument,
      start_date: params.start_date,
      end_date: params.end_date,
      groups: params.groups?.join(','),
      period: params.period,
      fill: params.fill ?? true,
      apply_mapping: params.apply_mapping ?? true,
      response_format: params.response_format ?? 'JSON',
    });
  }

  /**
   * Get historical OHLCV+ data at hour resolution.
   * Endpoint: GET /index/cc/v1/historical/hours
   */
  async getHistoricalHours(params: HistoricalParams): Promise<HistoricalOHLCVResponse> {
    return this.fetch('/index/cc/v1/historical/hours', {
      market: params.market,
      instrument: params.instrument,
      start_date: params.start_date,
      end_date: params.end_date,
      groups: params.groups?.join(','),
      period: params.period,
      fill: params.fill ?? true,
      apply_mapping: params.apply_mapping ?? true,
      response_format: params.response_format ?? 'JSON',
    });
  }

  /**
   * Get historical OHLCV+ data at minute resolution.
   * Endpoint: GET /index/cc/v1/historical/minutes
   */
  async getHistoricalMinutes(params: HistoricalParams): Promise<HistoricalOHLCVResponse> {
    return this.fetch('/index/cc/v1/historical/minutes', {
      market: params.market,
      instrument: params.instrument,
      start_date: params.start_date,
      end_date: params.end_date,
      groups: params.groups?.join(','),
      period: params.period,
      fill: params.fill ?? true,
      apply_mapping: params.apply_mapping ?? true,
      response_format: params.response_format ?? 'JSON',
    });
  }

  /**
   * Get instrument metadata for an index market.
   * Endpoint: GET /index/cc/v1/latest/instrument/metadata
   */
  async getInstrumentMetadata(params: InstrumentMetadataParams): Promise<InstrumentMetadataResponse> {
    return this.fetch('/index/cc/v1/latest/instrument/metadata', {
      market: params.market,
      instruments: params.instruments?.join(','),
      groups: params.groups?.join(','),
    });
  }

  /**
   * Get list of available index markets.
   * Endpoint: GET /index/cc/v1/markets
   * Note: This endpoint is deprecated; prefer index_cc_v2_markets
   */
  async getMarkets(params?: MarketsParams): Promise<MarketsResponse> {
    return this.fetch('/index/cc/v1/markets', {
      market: params?.market,
      groups: params?.groups?.join(','),
    });
  }

  /**
   * Get markets with their instruments.
   * Endpoint: GET /index/cc/v1/markets/instruments
   */
  async getMarketInstruments(params?: MarketsParams): Promise<MarketInstrumentsResponse> {
    return this.fetch('/index/cc/v1/markets/instruments', {
      market: params?.market,
      groups: params?.groups?.join(','),
    });
  }

  /**
   * Convenience: Get last N days of OHLCV data for an instrument.
   */
  async getLastNDays(
    market: Market,
    instrument: string,
    days: number = 30
  ): Promise<HistoricalOHLCVResponse> {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - (days - 1));

    const toDateStr = (d: Date) => d.toISOString().split('T')[0] || '';

    const params: Partial<HistoricalParams> = {
      market,
      instrument,
    };
    const s = toDateStr(start);
    const e = toDateStr(end);
    if (s) params.start_date = s as string;
    if (e) params.end_date = e as string;
    return this.getHistoricalDays(params as HistoricalParams);
  }
}

export default CoinDeskSDK;
