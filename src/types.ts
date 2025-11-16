export interface PriceData {
  readonly timestamp: number;
  readonly price: number;
}

export interface VolatilityMetrics {
  readonly volatility: number;
  readonly variance: number;
  readonly annualizedVolatility: number;
}

export interface DVOLMetrics {
  readonly dvol: number;
  readonly dvolIndex: number;
  readonly method: DVOLMethod;
}

export interface VolatilityResult {
  readonly symbol: CryptoSymbol;
  readonly period: TimePeriod;
  readonly metrics: VolatilityMetrics;
  readonly dvol: DVOLMetrics;
  readonly dataPoints: number;
  readonly calculatedAt: Date;
  readonly provider: string;
}

export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly statusCode?: number;
}

export type CryptoSymbol = 'bitcoin' | 'solana';
export type TimePeriod = '1d' | '30d' | '365d';
export type DVOLMethod = 'simple' | 'ewma' | 'garch';

export interface VolatilityOptions {
  readonly dvolMethod?: DVOLMethod;
  readonly ewmaLambda?: number;
  readonly garchParams?: GARCHParams;
}

export interface GARCHParams {
  readonly omega: number;
  readonly alpha: number;
  readonly beta: number;
}

export interface CoinGeckoPrice {
  readonly timestamp: number;
  readonly price: number;
}

export interface CoinGeckoResponse {
  readonly prices: readonly [number, number][];
}

export interface JupiterPriceData {
  readonly id: string;
  readonly type: string;
  readonly price: string;
  readonly timestamp?: number;
}

export interface JupiterPricesResponse {
  readonly data: Record<string, JupiterPriceData>;
  readonly timeTaken: number;
  readonly contextSlot: number;
}

export interface JupiterHistoricalResponse {
  readonly data: readonly {
    readonly timestamp: number;
    readonly price: number;
  }[];
}

export interface CoinLoreCoin {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly nameid: string;
  readonly price_usd: string;
  readonly percent_change_24h: string;
  readonly percent_change_1h: string;
  readonly percent_change_7d: string;
  readonly price_btc: string;
  readonly market_cap_usd: string;
  readonly volume24: string;
  readonly volume24a: string;
  readonly csupply: string;
  readonly tsupply: string;
  readonly msupply: string;
}

export interface CoinLoreResponse {
  readonly data: readonly CoinLoreCoin[];
}

export interface CoinLoreGlobalResponse {
  readonly btc_d: string;
  readonly btc_p: string;
  readonly eth_d: string;
  readonly eth_p: string;
  readonly alt_d: string;
  readonly alt_p: string;
  readonly altcap: string;
  readonly btcap: string;
  readonly etcap: string;
  readonly total_mcap: string;
  readonly mcap_change: string;
  readonly volume: string;
  readonly btc_volume: string;
  readonly eth_volume: string;
  readonly alt_volume: string;
}

export interface CoinDeskCurrentPriceResponse {
  readonly time?: Record<string, string>;
  readonly disclaimer?: string;
  readonly chartName?: string;
  readonly bpi?: Record<string, {
    readonly code?: string;
    readonly rate?: string;
    readonly description?: string;
    readonly rate_float?: number;
  }>;
}

export interface CoinDeskPricePoint {
  readonly timestamp: number;
  readonly price: number;
}

export interface CoinDeskHistoricalResponse {
  readonly prices: readonly CoinDeskPricePoint[];
}
