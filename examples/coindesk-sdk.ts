#!/usr/bin/env node
/**
 * CoinDesk SDK Example
 * Demonstrates usage of all /index/cc/v1 endpoints
 */

import { CoinDeskSDK } from '../src/sdk/coindesk';

async function main() {
  console.log('🚀 CoinDesk SDK Example\n');

  // Initialize SDK (uses COINDESK_API_KEY env var if set)
  //const sdk = new CoinDeskSDK();


const sdk = new CoinDeskSDK({
  //baseUrl: 'https://data-api.cryptocompare.com', // default
  baseUrl: 'https://data-api.coindesk.com',
  apiKey: 'fa9817f4cb904c8dcacb9cfdb8f5c83fbefb1209a90ab621bfbf38871de70520',
  apiKeyHeader: 'api_key', // header name for API key
});

  try {
    // 1. Get latest tick data for CADLI index
    console.log('1️⃣  Getting latest tick for CADLI index...');
    const latestTick = await sdk.getLatestTick({
      market: 'cadli',
      instruments: ['BTC-USD'],//, 'ETH-USD'],
      apply_mapping: true,
    });
    console.log(`✅ Latest tick: ${JSON.stringify(latestTick.Data)}\n`);
    

    // 2. Get historical daily OHLCV data
    console.log('2️⃣  Getting 7 days of historical OHLCV data...');
    const historicalDays = await sdk.getLastNDays('cadli', 'BTC-USD', 7);
    console.log(
      `✅ ${historicalDays.Data?.length || 0} daily entries:`,
      historicalDays.data?.[0]
    );
    console.log();

    // 3. Get historical hourly OHLCV data
    console.log('3️⃣  Getting last 24 hours of hourly OHLCV data...');
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const toDateStr = (d: Date) => d.toISOString().split('T')[0] || '';

    const historicalHours = await sdk.getHistoricalHours({
      market: 'cadli',
      instrument: 'BTC-USD',
      start_date: toDateStr(yesterday) || undefined,
      end_date: toDateStr(now) || undefined,
    });
    console.log(
      `✅ ${historicalHours.data?.length || 0} hourly entries available\n`
    );

    // 4. Get instrument metadata
    console.log('4️⃣  Getting instrument metadata...');
    const metadata = await sdk.getInstrumentMetadata({
      market: 'cadli',
      instruments: ['BTC-USD', 'ETH-USD'],
    });
    console.log(
      `✅ Instruments: ${metadata.data?.map((m) => m.instrument).join(', ')}\n`
    );

    // 5. Get available markets
    console.log('5️⃣  Getting available markets...');
    const markets = await sdk.getMarkets();
    console.log(
      `✅ Found ${markets.data?.length || 0} markets\n`
    );

    console.log('✨ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
