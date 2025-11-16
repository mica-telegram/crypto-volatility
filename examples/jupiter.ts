/**
 * Exemple d'utilisation du provider Jupiter API
 * 
 * Cet exemple montre comment:
 * 1. Utiliser le provider Jupiter pour récupérer les données de prix
 * 2. Comparer Jupiter avec CoinGecko
 * 3. Récupérer le prix actuel via Jupiter
 * 4. Calculer la volatilité avec les données Jupiter
 */

import { DVOLCalculator } from '../src/calculators/dvol.js';
import { VolatilityCalculator } from '../src/calculators/volatility.js';
import { CoinGeckoProvider } from '../src/providers/coingecko.js';
import { JupiterProvider } from '../src/providers/jupiter.js';
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
    Formatter.separator('JUPITER PROVIDER - EXEMPLE D\'UTILISATION');

    // 1. Initialisation des fournisseurs
    console.log('📡 Initialisation des fournisseurs...\n');
    const jupiterProvider = new JupiterProvider();
    const coingeckoProvider = new CoinGeckoProvider();

    console.log(`✓ Jupiter Provider: ${jupiterProvider.getName()}`);
    console.log(`✓ CoinGecko Provider: ${coingeckoProvider.getName()}`);

    // 2. Récupération du prix actuel via Jupiter
    Formatter.separator('RÉCUPÉRATION DU PRIX ACTUEL');

    const symbols: CryptoSymbol[] = ['bitcoin', 'solana'];

    for (const symbol of symbols) {
      console.log(`Récupération du prix actuel pour ${symbol.toUpperCase()}...`);
      const priceResponse = await jupiterProvider.getCurrentPrice(symbol);

      if (priceResponse.success && priceResponse.data !== undefined) {
        console.log(`✓ ${symbol.toUpperCase()}: ${Formatter.formatPrice(priceResponse.data)}`);
      } else {
        console.log(`✗ Erreur: ${priceResponse.error}`);
      }
    }

    // 3. Comparaison des providers
    Formatter.separator('COMPARAISON PROVIDERS');

    const crypto: CryptoSymbol = 'bitcoin';
    const period: TimePeriod = '30d';

    console.log(`Configuration:`);
    console.log(`  • Crypto: ${crypto.toUpperCase()}`);
    console.log(`  • Période: ${period}\n`);

    // Récupération depuis Jupiter
    console.log('📥 Récupération depuis Jupiter...');
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

    // 4. Calcul de la volatilité pour chaque provider
    Formatter.separator('CALCUL DE LA VOLATILITÉ');

    console.log('Calcul de la volatilité pour chaque provider...\n');

    const jupiterVolatility = VolatilityCalculator.calculateMetrics(jupiterData.data, period);
    console.log('📊 Résultats Jupiter:');
    console.log(`  Volatilité: ${Formatter.formatPercentage(jupiterVolatility.volatility)}`);
    console.log(`  Volatilité Annualisée: ${Formatter.formatPercentage(jupiterVolatility.annualizedVolatility)}`);
    console.log(`  Variance: ${Formatter.formatNumber(jupiterVolatility.variance)}`);

    const coingeckoVolatility = VolatilityCalculator.calculateMetrics(coingeckoData.data, period);
    console.log('\n📊 Résultats CoinGecko:');
    console.log(`  Volatilité: ${Formatter.formatPercentage(coingeckoVolatility.volatility)}`);
    console.log(`  Volatilité Annualisée: ${Formatter.formatPercentage(coingeckoVolatility.annualizedVolatility)}`);
    console.log(`  Variance: ${Formatter.formatNumber(coingeckoVolatility.variance)}`);

    // Comparaison
    Formatter.subsection('Différences');
    const volDiff = Math.abs(jupiterVolatility.volatility - coingeckoVolatility.volatility);
    console.log(`  Différence de volatilité: ${Formatter.formatPercentage(volDiff)}`);

    // 5. Calcul du DVOL avec les données Jupiter
    Formatter.separator('DVOL VIA JUPITER');

    console.log('Calcul du DVOL avec la méthode EWMA...\n');
    const jupiterDvol = DVOLCalculator.calculateDVOL(jupiterData.data, 'ewma', {
      windowSize: 20,
      ewmaLambda: 0.94,
    });

    console.log('📈 Résultats DVOL:');
    console.log(`  DVOL: ${Formatter.formatPercentage(jupiterDvol.dvol)}`);
    console.log(`  Index DVOL: ${Formatter.formatNumber(jupiterDvol.dvolIndex)}`);
    console.log(`  Confiance: ${Formatter.formatPercentage(jupiterDvol.confidence)}`);

    // 6. Analyse des données Jupiter
    Formatter.separator('ANALYSE DES DONNÉES JUPITER');

    const prices = jupiterData.data.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    console.log('Statistiques descriptives:');
    console.log(`  Prix minimum: ${Formatter.formatPrice(minPrice)}`);
    console.log(`  Prix maximum: ${Formatter.formatPrice(maxPrice)}`);
    console.log(`  Prix moyen: ${Formatter.formatPrice(avgPrice)}`);
    console.log(`  Plage: ${Formatter.formatPrice(maxPrice - minPrice)}`);
    console.log(`  Plage relative: ${Formatter.formatPercentage((maxPrice - minPrice) / minPrice * 100)}`);

    // 7. Diagnostics des données Jupiter
    Formatter.separator('DIAGNOSTICS DONNÉES JUPITER');

    try {
      const diagnostics = DVOLCalculator.calculateDiagnostics(jupiterData.data, 'ewma');

      console.log('Indicateurs statistiques:');
      console.log(`  Autocorrélation: ${Formatter.formatNumber(diagnostics.autocorrelation, 4)}`);
      console.log(`  Hétéroscédasticité: ${Formatter.formatNumber(diagnostics.heteroskedasticity, 4)}`);
      console.log(`  Asymétrie: ${Formatter.formatNumber(diagnostics.skewness, 4)}`);
      console.log(`  Aplatissement: ${Formatter.formatNumber(diagnostics.kurtosis, 4)}`);

      Formatter.subsection('Qualité des données');
      if (Math.abs(diagnostics.autocorrelation) < 0.1) {
        console.log(`  ✓ Rendements peu corrélés`);
      } else {
        console.log(`  ⚠ Autocorrélation détectée`);
      }

      if (diagnostics.heteroskedasticity > 0.3) {
        console.log(`  ⚠ Volatilité changeante`);
      } else {
        console.log(`  ✓ Volatilité stable`);
      }
    } catch (error) {
      console.error(`Erreur dans le diagnostic: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    // 8. Utilisation multi-symbole
    Formatter.separator('ANALYSE MULTI-SYMBOLES');

    console.log('Récupération et analyse pour Bitcoin et Solana...\n');

    const symbolsToAnalyze: CryptoSymbol[] = ['bitcoin', 'solana'];
    const results = new Map<CryptoSymbol, any>();

    for (const symbol of symbolsToAnalyze) {
      const priceData = await jupiterProvider.fetchPriceData(symbol, '30d');

      if (!priceData.success || !priceData.data) {
        console.log(`✗ Erreur pour ${symbol}: ${priceData.error}`);
        continue;
      }

      const volatility = VolatilityCalculator.calculateMetrics(priceData.data, '30d');
      const dvol = DVOLCalculator.calculateDVOL(priceData.data, 'ewma');

      results.set(symbol, { volatility, dvol });
      console.log(`✓ ${symbol.toUpperCase()}`);
      console.log(`  Volatilité: ${Formatter.formatPercentage(volatility.volatility)}`);
      console.log(`  DVOL: ${Formatter.formatPercentage(dvol.dvol)}`);
    }

    // Comparaison
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
