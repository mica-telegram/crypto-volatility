/**
 * CoinDesk /index/cc/v1 SDK Types
 * Generated from OpenAPI spec at https://data-api.coindesk.com/info/v1/openapi
 */

// Market types
export type Market = 
  | 'cadli' | 'cchkex' | 'cchkex_eod' | 'ccix' | 'ccixbe' | 'ccixber' | 'ccixbervwap'
  | 'ccixbevwap' | 'ccixdev' | 'ccmvda_coint' | 'ccmvda_virt' | 'ccmvdarra' | 'ccxrp'
  | 'ccxrpperp' | 'cd_mc' | 'cdi_b' | 'cdi_mda' | 'cdi_ti' | 'cdisett' | 'cdmcdev'
  | 'cdor' | 'nasdaq_single' | 'rr_spot' | 'rr_vwap' | 'sda' | 'sgx_rr' | 'sgxrt' | 'sgxtwap';

export type ResponseFormat = 'JSON' | 'CSV';

// Common request/response types
export interface SDKOptions {
  baseUrl?: string;
  apiKey?: string;
  apiKeyHeader?: string; // 'api_key' header name (default: 'api_key')
}

export interface ErrorResponse {
  error?: string;
  message?: string;
  code?: number;
}

// Latest Tick Response (Type 246, 266, 985, 987)
export interface IndexValue {
  code?: string;
  rate?: string;
  rate_float?: number;
}

export interface TickMetadata {
  time?: string;
  updated?: string;
  updatedISO?: string;
  [key: string]: any;
}

export interface OHLCMetrics {
  ohlc?: {
    [key: string]: {
      c?: number; // Close
      h?: number; // High
      l?: number; // Low
      o?: number; // Open
    };
  };
}

export interface LatestTickData {
  value?: number;
  high?: number;
  low?: number;
  currency_code?: string;
  timestamp?: number | string;
  update_timestamp?: number | string;
  [key: string]: any;
}

export interface LatestTickResponse {
  data?: LatestTickData[];
  aggregated_data?: OHLCMetrics;
  time?: TickMetadata;
  disclaimer?: string;
  [key: string]: any;
}

// Historical OHLCV+ Day/Hour/Minute Response
export interface OHLCVEntry {
  time?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  quote_volume?: number;
  total_index_updates?: number;
  [key: string]: any;
}

export interface HistoricalOHLCVResponse {
  data?: OHLCVEntry[];
  time?: TickMetadata;
  [key: string]: any;
}

// Instrument Metadata Response
export interface InstrumentMetadataEntry {
  id?: string;
  instrument?: string;
  name?: string;
  currency?: string;
  base_asset?: string;
  quote_asset?: string;
  status?: 'ACTIVE' | 'RETIRED' | 'EXPIRED' | 'IGNORED' | 'READY_FOR_DECOMMISSIONING';
  mapping?: Record<string, any>;
  internal_data?: Record<string, any>;
  [key: string]: any;
}

export interface InstrumentMetadataResponse {
  data?: InstrumentMetadataEntry[];
  time?: TickMetadata;
  [key: string]: any;
}

// Markets Response
export interface MarketEntry {
  id?: string;
  name?: string;
  launch_date?: string;
  rank?: number;
  instrument_count?: number;
  status?: string;
  description?: string;
  [key: string]: any;
}

export interface MarketsResponse {
  data?: MarketEntry[];
  time?: TickMetadata;
  [key: string]: any;
}

// Markets + Instruments Response
export interface MarketInstrumentsEntry {
  market?: string;
  instruments?: InstrumentMetadataEntry[];
  metadata?: MarketEntry;
  [key: string]: any;
}

export interface MarketInstrumentsResponse {
  data?: MarketInstrumentsEntry[];
  time?: TickMetadata;
  [key: string]: any;
}

// Request parameter types
export interface LatestTickParams {
  market: Market;
  instruments?: string[];
  groups?: string[];
  apply_mapping?: boolean;
}

export interface HistoricalParams {
  market: Market;
  instrument: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  groups?: string[];
  period?: number;
  fill?: boolean;
  apply_mapping?: boolean;
  response_format?: ResponseFormat;
}

export interface InstrumentMetadataParams {
  market: Market;
  instruments?: string[];
  groups?: string[];
}

export interface MarketsParams {
  market?: Market;
  groups?: string[];
}

// --- Spot /spot/v1/latest types ---
export interface SpotLatestTickParams {
  market: string; // exchange name, e.g. 'coinbase'
  instruments?: string[]; // e.g. ['BTC-USD']
  groups?: string[];
  apply_mapping?: boolean;
  response_format?: ResponseFormat;
}

export interface SpotLatestTickEntry {
  instrument?: string;
  price?: number;
  base?: string;
  quote?: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

export interface SpotLatestTickResponse {
  data?: SpotLatestTickEntry[];
  time?: TickMetadata;
  [key: string]: any;
}

export interface SpotInstrumentMetadataResponse {
  data?: InstrumentMetadataEntry[];
  time?: TickMetadata;
  [key: string]: any;
}

export interface SpotOrderBookParams {
  market: string;
  instrument: string;
  depth?: number;
  response_format?: ResponseFormat;
}

export interface OrderBookSideEntry {
  price: number;
  size: number;
}

export interface SpotOrderBookResponse {
  bids?: OrderBookSideEntry[];
  asks?: OrderBookSideEntry[];
  time?: TickMetadata;
  [key: string]: any;
}

export interface SpotMarketsResponse {
  data?: MarketEntry[];
  time?: TickMetadata;
}

export interface SpotMarketInstrumentsResponse {
  data?: MarketInstrumentsEntry[];
  time?: TickMetadata;
}

// --- Futures /futures/v1/latest types ---
export interface FuturesLatestParams {
  market: string; // exchange name
  instruments?: string[];
  groups?: string[];
  apply_mapping?: boolean;
  response_format?: ResponseFormat;
}

export interface FuturesLatestTickEntry {
  instrument?: string;
  price?: number;
  mark_price?: number;
  open_interest?: number;
  funding_rate?: number;
  timestamp?: number;
  [key: string]: any;
}

export interface FuturesLatestTickResponse {
  data?: FuturesLatestTickEntry[];
  time?: TickMetadata;
  [key: string]: any;
}

export interface FuturesInstrumentMetadataResponse {
  data?: InstrumentMetadataEntry[];
  time?: TickMetadata;
  [key: string]: any;
}

export interface FuturesOpenInterestEntry {
  instrument?: string;
  open_interest?: number;
  base?: string;
  quote?: string;
  timestamp?: number;
}

export interface FuturesOpenInterestResponse {
  data?: FuturesOpenInterestEntry[];
  time?: TickMetadata;
}

export interface FuturesFundingEntry {
  instrument?: string;
  funding_rate?: number;
  next_funding_time?: number;
  timestamp?: number;
}

export interface FuturesFundingResponse {
  data?: FuturesFundingEntry[];
  time?: TickMetadata;
}

export interface FuturesOrderBookParams {
  market: string;
  instrument: string;
  depth?: number;
}

export interface FuturesOrderBookResponse {
  bids?: OrderBookSideEntry[];
  asks?: OrderBookSideEntry[];
  time?: TickMetadata;
}
