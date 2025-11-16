# CoinDesk /index/cc/v1 TypeScript SDK

Fully-typed TypeScript SDK for CoinDesk's cryptocurrency index endpoints (`/index/cc/v1`).

## Features

- **Complete coverage** of all `/index/cc/v1` endpoints
- **Full TypeScript support** with strict types
- **Zero dependencies** (uses native `fetch`)
- **API key support** via env var or constructor option
- **Convenience methods** for common operations (e.g., `getLastNDays`)

## Installation

Already included in the `crypto-volatility` package. SDK is located in `src/sdk/coindesk/`.

## Quick Start

```typescript
import { CoinDeskSDK } from '../src/sdk/coindesk';

const sdk = new CoinDeskSDK();

// Get latest tick for CADLI index
const tick = await sdk.getLatestTick({
  market: 'cadli',
  instruments: ['BTC-USD', 'ETH-USD'],
});
console.log(tick.data);

// Get last 7 days of OHLCV data
const ohlcv = await sdk.getLastNDays('cadli', 'BTC-USD', 7);
console.log(ohlcv.data);
```

## Configuration

### Environment Variables

```bash
export COINDESK_API_KEY="your_api_key_here"
```

### Constructor Options

```typescript
const sdk = new CoinDeskSDK({
  baseUrl: 'https://data-api.cryptocompare.com', // default
  apiKey: 'your_api_key_here',
  apiKeyHeader: 'api_key', // header name for API key
});
```

## Endpoints

### Latest Data

- **`getLatestTick(params)`** — Get latest tick for index instruments
  - Endpoint: `GET /index/cc/v1/latest/tick`
  - Returns: Latest OHLC and index values

- **`getInstrumentMetadata(params)`** — Get metadata for instruments
  - Endpoint: `GET /index/cc/v1/latest/instrument/metadata`
  - Returns: Instrument details (mappings, status, etc.)

### Historical Data

- **`getHistoricalDays(params)`** — Daily OHLCV+ data
  - Endpoint: `GET /index/cc/v1/historical/days`

- **`getHistoricalHours(params)`** — Hourly OHLCV+ data
  - Endpoint: `GET /index/cc/v1/historical/hours`

- **`getHistoricalMinutes(params)`** — Minute OHLCV+ data
  - Endpoint: `GET /index/cc/v1/historical/minutes`

- **`getLastNDays(market, instrument, days)`** — Convenience method for recent days

### Markets

- **`getMarkets(params?)`** — List available index markets
  - Endpoint: `GET /index/cc/v1/markets` (deprecated, for reference)

- **`getMarketInstruments(params?)`** — Markets with instruments
  - Endpoint: `GET /index/cc/v1/markets/instruments`

## Type Definitions

All responses are fully typed:

```typescript
import type {
  Market,
  LatestTickResponse,
  HistoricalOHLCVResponse,
  InstrumentMetadataResponse,
  MarketsResponse,
} from '../src/sdk/coindesk';
```

### Supported Markets

```typescript
type Market =
  | 'cadli' | 'cchkex' | 'ccix' | 'ccixbe' | 'ccixber'
  | 'cd_mc' | 'cdi_b' | 'cdi_mda' | 'cdi_ti'
  // ... and more
```

## Examples

### Run the example

```bash
npm run example:coindesk-sdk
```

Or with API key:

```bash
COINDESK_API_KEY="your_key" npm run example:coindesk-sdk
```
# COINDESK_API_KEY = 'fa9817f4cb904c8dcacb9cfdb8f5c83fbefb1209a90ab621bfbf38871de70520'  npm run example:coindesk-sdk

### Custom Usage

```typescript
import { CoinDeskSDK } from '../src/sdk/coindesk';

const sdk = new CoinDeskSDK({
  apiKey: process.env.COINDESK_API_KEY,
});

// Get BTC-USD historical data
try {
  const data = await sdk.getHistoricalDays({
    market: 'cadli',
    instrument: 'BTC-USD',
    start_date: '2024-01-01',
    end_date: '2024-01-31',
  });
  
  data.data?.forEach((entry) => {
    console.log(`${entry.time}: O=${entry.open} H=${entry.high} L=${entry.low} C=${entry.close}`);
  });
} catch (err) {
  console.error('API Error:', err);
}
```

## Error Handling

All API calls throw with descriptive messages:

```typescript
try {
  await sdk.getLatestTick({ market: 'invalid' });
} catch (err) {
  console.error(err.message); // "CoinDesk API error 400: ..."
}
```

## Notes

- All dates in requests use `YYYY-MM-DD` format
- Response format defaults to `JSON` (CSV also supported)
- `apply_mapping` defaults to `true` (normalizes instrument names)
- Historical endpoints support optional `fill` parameter (default: `true`) to fill gaps
- Requests include API key as query param or header (configurable)

## References

- **OpenAPI Spec**: https://data-api.coindesk.com/info/v1/openapi
- **API Docs**: https://cryptocompare.com/api/documentation
