/**
 * Exemple d'utilisation du provider CoinLore API
 * 
 * Cet exemple montre comment:
 * 1. Utiliser le provider CoinLore pour récupérer les données de prix
 * 2. Récupérer les informations détaillées des cryptos
 * 3. Comparer les providers (CoinGecko, Jupiter, CoinLore)
 * 4. Calculer la volatilité avec CoinLore
 */

import { DVOLCalculator } from '../src/calculators/dvol.js';
import { VolatilityCalculator } from '../src/calculators/volatility.js';
import { CoinGeckoProvider } from '../src/providers/coingecko.js';
import { JupiterProvider } from '../src/providers/jupiter.js';
import { CoinLoreProvider } from '../src/providers/coinlore.js';
import type { CryptoSymbol, TimePeriod } from '../src/types.js';

/**
 * Classe utilitaire pour formater les nombres
 */
class Formatter {
  static formatPercentage(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`;
  }

  static formatNumber(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
  }

  static formatPrice(value: number, decimals: number = 2): string {
    return `$${value.toFixed(decimals)}`;
  }

  static formatMarketCap(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return 'N/A';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  }

  static separator(title: string): void {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  ${title}`);
    console.log(`${'='.repeat(60)}\n`);
  }

  static subsection(title: string): void {
    console.log(`\n→ ${title}`);
    console.log(`${'-'.repeat(40)}`);
  }
}

/**
 * Fonction principale
 */
async function main() {
  try {
    Formatter.separator('COINLORE PROVIDER - EXEMPLE D\'UTILISATION');

    // 1. Initialisation des fournisseurs
    console.log('📡 Initialisation des fournisseurs...\n');
    const coinloreProvider = new CoinLoreProvider();
    const jupiterProvider = new JupiterProvider();
    const coingeckoProvider = new CoinGeckoProvider();

    console.log(`✓ CoinLore Provider: ${coinloreProvider.getName()}`);
    console.log(`✓ Jupiter Provider: ${jupiterProvider.getName()}`);
    console.log(`✓ CoinGecko Provider: ${coingeckoProvider.getName()}`);

    // 2. Récupération du prix actuel via CoinLore
    Formatter.separator('RÉCUPÉRATION DU PRIX ACTUEL');

    const symbols: CryptoSymbol[] = ['bitcoin', 'solana'];

    for (const symbol of symbols) {
      console.log(`Récupération du prix actuel pour ${symbol.toUpperCase()}...`);
      const priceResponse = await coinloreProvider.getCurrentPrice(symbol);

      if (priceResponse.success && priceResponse.data !== undefined) {
        console.log(`✓ ${symbol.toUpperCase()}: ${Formatter.formatPrice(priceResponse.data)}`);
      } else {
        console.log(`✗ Erreur: ${priceResponse.error}`);
      }
    }

    // 3. Récupération des détails des cryptos
    Formatter.separator('DÉTAILS DES CRYPTOS');

    for (const symbol of symbols) {
      console.log(`Récupération des détails pour ${symbol.toUpperCase()}...\n`);
      const detailsResponse = await coinloreProvider.getCoinDetails(symbol);

      if (detailsResponse.success && detailsResponse.data) {
        const coin = detailsResponse.data;
        console.log(`Nom: ${coin.name} (${coin.symbol})`);
        console.log(`Prix USD: ${Formatter.formatPrice(parseFloat(coin.price_usd))}`);
        console.log(`Market Cap: ${Formatter.formatMarketCap(coin.market_cap_usd)}`);
        console.log(`Volume 24h: ${Formatter.formatMarketCap(coin.volume24)}`);
        console.log(`Variation 24h: ${Formatter.formatPercentage(parseFloat(coin.percent_change_24h))}`);
        console.log(`Variation 1h: ${Formatter.formatPercentage(parseFloat(coin.percent_change_1h))}`);
        console.log(`Variation 7d: ${Formatter.formatPercentage(parseFloat(coin.percent_change_7d))}`);
      } else {
        console.log(`✗ Erreur: ${detailsResponse.error}`);
      }
    }

    // 4. Comparaison des trois providers
    Formatter.separator('COMPARAISON DES TROIS PROVIDERS');

    const crypto: CryptoSymbol = 'bitcoin';
    const period: TimePeriod = '30d';

    console.log(`Configuration:`);
    console.log(`  • Crypto: ${crypto.toUpperCase()}`);
    console.log(`  • Période: ${period}\n`);

    // Récupération depuis CoinLore
    console.log('📥 Récupération depuis CoinLore...');
    const coinloreData = await coinloreProvider.fetchPriceData(crypto, period);

    if (!coinloreData.success || !coinloreData.data) {
      throw new Error(`Erreur CoinLore: ${coinloreData.error}`);
    }

    console.log(`✓ ${coinloreData.data.length} points de données`);

    // Récupération depuis Jupiter
    console.log('\n📥 Récupération depuis Jupiter...');
    const jupiterData = await jupiterProvider.fetchPriceData(crypto, period);

    if (!jupiterData.success || !jupiterData.data) {
      throw new Error(`Erreur Jupiter: ${jupiterData.error}`);
    }

    console.log(`✓ ${jupiterData.data.length} points de données`);

    // Récupération depuis CoinGecko
    console.log('\n📥 Récupération depuis CoinGecko...');
    const coingeckoData = await coingeckoProvider.fetchPriceData(crypto, period);

    if (!coingeckoData.success || !coingeckoData.data) {
      throw new Error(`Erreur CoinGecko: ${coingeckoData.error}`);
    }

    console.log(`✓ ${coingeckoData.data.length} points de données`);

    // 5. Calcul de la volatilité pour chaque provider
    Formatter.separator('CALCUL DE LA VOLATILITÉ');

    console.log('Calcul de la volatilité pour chaque provider...\n');

    const coinloreVolatility = VolatilityCalculator.calculateMetrics(coinloreData.data, period);
    console.log('📊 Résultats CoinLore:');
    console.log(`  Volatilité: ${Formatter.formatPercentage(coinloreVolatility.volatility)}`);
    console.log(`  Volatilité Annualisée: ${Formatter.formatPercentage(coinloreVolatility.annualizedVolatility)}`);
    console.log(`  Variance: ${Formatter.formatNumber(coinloreVolatility.variance)}`);

    const jupiterVolatility = VolatilityCalculator.calculateMetrics(jupiterData.data, period);
    console.log('\n📊 Résultats Jupiter:');
    console.log(`  Volatilité: ${Formatter.formatPercentage(jupiterVolatility.volatility)}`);
    console.log(`  Volatilité Annualisée: ${Formatter.formatPercentage(jupiterVolatility.annualizedVolatility)}`);
    console.log(`  Variance: ${Formatter.formatNumber(jupiterVolatility.variance)}`);

    const coingeckoVolatility = VolatilityCalculator.calculateMetrics(coingeckoData.data, period);
    console.log('\n📊 Résultats CoinGecko:');
    console.log(`  Volatilité: ${Formatter.formatPercentage(coingeckoVolatility.volatility)}`);
    console.log(`  Volatilité Annualisée: ${Formatter.formatPercentage(coingeckoVolatility.annualizedVolatility)}`);
    console.log(`  Variance: ${Formatter.formatNumber(coingeckoVolatility.variance)}`);

    // 6. Calcul du DVOL avec CoinLore
    Formatter.separator('DVOL VIA COINLORE');

    console.log('Calcul du DVOL avec la méthode EWMA...\n');
    const coinloreDvol = DVOLCalculator.calculateDVOL(coinloreData.data, 'ewma', {
      windowSize: 20,
      ewmaLambda: 0.94,
    });

    console.log('📈 Résultats DVOL:');
    console.log(`  DVOL: ${Formatter.formatPercentage(coinloreDvol.dvol)}`);
    console.log(`  Index DVOL: ${Formatter.formatNumber(coinloreDvol.dvolIndex)}`);
    console.log(`  Confiance: ${Formatter.formatPercentage(coinloreDvol.confidence)}`);

    // 7. Comparaison des volatilités
    Formatter.separator('COMPARAISON DES VOLATILITÉS');

    const providers = [
      { name: 'CoinLore', vol: coinloreVolatility.volatility },
      { name: 'Jupiter', vol: jupiterVolatility.volatility },
      { name: 'CoinGecko', vol: coingeckoVolatility.volatility },
    ];

    providers.sort((a, b) => b.vol - a.vol);

    Formatter.subsection('Classement par volatilité');
    providers.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}: ${Formatter.formatPercentage(p.vol)}`);
    });

    // Statistiques
    const avgVol = providers.reduce((sum, p) => sum + p.vol, 0) / providers.length;
    const maxVol = providers[0]?.vol ?? 0;
    const minVol = providers[providers.length - 1]?.vol ?? 0;

    Formatter.subsection('Statistiques');
    console.log(`  Volatilité moyenne: ${Formatter.formatPercentage(avgVol)}`);
    console.log(`  Volatilité max: ${Formatter.formatPercentage(maxVol)}`);
    console.log(`  Volatilité min: ${Formatter.formatPercentage(minVol)}`);
    console.log(`  Écart: ${Formatter.formatPercentage(maxVol - minVol)}`);

    // 8. Analyse multi-symboles
    Formatter.separator('ANALYSE MULTI-SYMBOLES VIA COINLORE');

    console.log('Récupération et analyse pour Bitcoin et Solana...\n');

    const symbolsToAnalyze: CryptoSymbol[] = ['bitcoin', 'solana'];
    const results = new Map<CryptoSymbol, any>();

    for (const symbol of symbolsToAnalyze) {
      const priceData = await coinloreProvider.fetchPriceData(symbol, '30d');

      if (!priceData.success || !priceData.data) {
        console.log(`✗ Erreur pour ${symbol}: ${priceData.error}`);
        continue;
      }

      const volatility = VolatilityCalculator.calculateMetrics(priceData.data, '30d');
      const dvol = DVOLCalculator.calculateDVOL(priceData.data, 'ewma');
      const details = await coinloreProvider.getCoinDetails(symbol);

      results.set(symbol, { volatility, dvol, details });
      console.log(`✓ ${symbol.toUpperCase()}`);
      console.log(`  Volatilité: ${Formatter.formatPercentage(volatility.volatility)}`);
      console.log(`  DVOL: ${Formatter.formatPercentage(dvol.dvol)}`);
      
      if (details.success && details.data) {
        console.log(`  Prix: ${Formatter.formatPrice(parseFloat(details.data.price_usd))}`);
        console.log(`  Variation 24h: ${Formatter.formatPercentage(parseFloat(details.data.percent_change_24h))}`);
      }
      console.log();
    }

    // Classement par volatilité
    if (results.size > 1) {
      Formatter.subsection('Classement par volatilité');

      const sorted = Array.from(results.entries())
        .sort((a, b) => b[1].volatility.volatility - a[1].volatility.volatility);

      sorted.forEach(([symbol, data], index) => {
        console.log(`${index + 1}. ${symbol.toUpperCase()}: ${Formatter.formatPercentage(data.volatility.volatility)}`);
      });
    }

    Formatter.separator('EXEMPLE TERMINÉ');
    console.log('\n✓ Exécution réussie!\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error instanceof Error ? error.message : 'Erreur inconnue');
    console.error(error);
    process.exit(1);
  }
}

// Exécution
main().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
