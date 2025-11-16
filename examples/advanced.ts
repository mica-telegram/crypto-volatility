/**
 * Exemple Avancé - Cas d'usage avancés de crypto-volatility
 * 
 * Cet exemple montre des cas d'usage plus avancés:
 * - Comparaison de volatilité entre plusieurs cryptos
 * - Utilisation de différentes méthodes GARCH
 * - Suivi de la volatilité dans le temps
 * - Détection d'anomalies
 */

import { DVOLCalculator } from '../src/calculators/dvol.js';
import { VolatilityCalculator } from '../src/calculators/volatility.js';
import { CoinGeckoProvider } from '../src/providers/coingecko.js';
import type { CryptoSymbol, DVOLMethod, TimePeriod } from '../src/types.js';

/**
 * Classe pour analyser la volatilité de plusieurs cryptos
 */
class CryptoVolatilityAnalyzer {
  private provider: CoinGeckoProvider;

  constructor() {
    this.provider = new CoinGeckoProvider();
  }

  /**
   * Analyse la volatilité pour plusieurs cryptos
   */
  async analyzeMultipleCryptos(
    cryptos: CryptoSymbol[],
    period: TimePeriod,
    dvolMethod: DVOLMethod = 'ewma'
  ) {
    console.log('\n📊 ANALYSE DE VOLATILITÉ MULTI-CRYPTO');
    console.log('='.repeat(50));
    console.log(`Période: ${period} | Méthode DVOL: ${dvolMethod.toUpperCase()}`);
    console.log('='.repeat(50));

    const results = new Map<CryptoSymbol, { volatility: number; dvol: number; index: number }>();

    for (const crypto of cryptos) {
      try {
        const response = await this.provider.fetchPriceData(crypto, period);

        if (!response.success || !response.data) {
          console.log(`\n✗ ${crypto.toUpperCase()}: ${response.error}`);
          continue;
        }

        const volatility = VolatilityCalculator.calculateMetrics(response.data, period);
        const dvol = DVOLCalculator.calculateDVOL(response.data, dvolMethod);

        results.set(crypto, {
          volatility: volatility.volatility,
          dvol: dvol.dvol,
          index: dvol.dvolIndex,
        });

        console.log(`\n✓ ${crypto.toUpperCase()}`);
        console.log(`  Volatilité: ${volatility.volatility.toFixed(2)}%`);
        console.log(`  DVOL: ${dvol.dvol.toFixed(2)}%`);
        console.log(`  Index: ${dvol.dvolIndex.toFixed(1)}/100`);
      } catch (error) {
        console.log(`\n✗ ${crypto.toUpperCase()}: Erreur ${error instanceof Error ? error.message : 'inconnue'}`);
      }
    }

    // Comparaison
    if (results.size > 1) {
      this.compareResults(results);
    }

    return results;
  }

  /**
   * Compare les résultats
   */
  private compareResults(results: Map<CryptoSymbol, any>) {
    console.log('\n' + '='.repeat(50));
    console.log('📈 CLASSEMENT PAR VOLATILITÉ');
    console.log('='.repeat(50));

    const sorted = Array.from(results.entries())
      .sort((a, b) => b[1].dvol - a[1].dvol)
      .map(([crypto, data], idx) => ({
        rank: idx + 1,
        crypto,
        dvol: data.dvol,
        index: data.index,
      }));

    sorted.forEach(item => {
      console.log(`${item.rank}. ${item.crypto.toUpperCase().padEnd(10)} - DVOL: ${item.dvol.toFixed(2)}% | Index: ${item.index.toFixed(1)}/100`);
    });

    const dvolValues = sorted.map(s => s.dvol);
    const maxDvol = Math.max(...dvolValues);
    const minDvol = Math.min(...dvolValues);
    const avgDvol = dvolValues.reduce((a, b) => a + b, 0) / dvolValues.length;

    console.log('\n' + '-'.repeat(50));
    console.log(`Moyenne DVOL: ${avgDvol.toFixed(2)}%`);
    console.log(`Range DVOL: ${minDvol.toFixed(2)}% - ${maxDvol.toFixed(2)}%`);
    console.log(`Écart: ${(maxDvol - minDvol).toFixed(2)}%`);
  }

  /**
   * Teste différentes méthodes DVOL
   */
  async compareDVOLMethods(crypto: CryptoSymbol, period: TimePeriod) {
    console.log('\n📊 COMPARAISON DES MÉTHODES DVOL');
    console.log('='.repeat(50));
    console.log(`Crypto: ${crypto.toUpperCase()} | Période: ${period}`);
    console.log('='.repeat(50));

    try {
      const response = await this.provider.fetchPriceData(crypto, period);

      if (!response.success || !response.data) {
        throw new Error(response.error);
      }

      const methods: DVOLMethod[] = ['simple', 'ewma', 'garch'];
      const results = new Map<DVOLMethod, any>();

      for (const method of methods) {
        try {
          const dvol = DVOLCalculator.calculateDVOL(response.data, method, {
            windowSize: 20,
            ewmaLambda: 0.94,
          });

          results.set(method, dvol);

          console.log(`\n${method.toUpperCase()}:`);
          console.log(`  DVOL: ${dvol.dvol.toFixed(2)}%`);
          console.log(`  Index: ${dvol.dvolIndex.toFixed(1)}/100`);
          console.log(`  Confiance: ${dvol.confidence.toFixed(1)}%`);
        } catch (error) {
          console.log(`\n${method.toUpperCase()}: Erreur - ${error instanceof Error ? error.message : 'inconnue'}`);
        }
      }

      if (results.size > 1) {
        this.compareMethodsResults(results);
      }
    } catch (error) {
      console.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Compare les résultats des méthodes
   */
  private compareMethodsResults(results: Map<DVOLMethod, any>) {
    console.log('\n' + '-'.repeat(50));
    console.log('🎯 ANALYSE COMPARATIVE');

    const dvolValues = Array.from(results.values()).map(r => r.dvol);
    const confidenceValues = Array.from(results.values()).map(r => r.confidence);

    const avgDvol = dvolValues.reduce((a, b) => a + b, 0) / dvolValues.length;
    const avgConfidence = confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length;

    const maxDvol = Math.max(...dvolValues);
    const minDvol = Math.min(...dvolValues);

    console.log(`\nDVOL moyen: ${avgDvol.toFixed(2)}%`);
    console.log(`Range: ${minDvol.toFixed(2)}% - ${maxDvol.toFixed(2)}%`);
    console.log(`Écart: ${(maxDvol - minDvol).toFixed(2)}% (${((maxDvol - minDvol) / avgDvol * 100).toFixed(1)}%)`);
    console.log(`\nConfiance moyenne: ${avgConfidence.toFixed(1)}%`);

    const bestMethod = Array.from(results.entries())
      .sort((a, b) => b[1].confidence - a[1].confidence)[0];

    console.log(`\nMéthode la plus fiable: ${bestMethod[0].toUpperCase()} (${bestMethod[1].confidence.toFixed(1)}%)`);
  }

  /**
   * Détecte les anomalies de volatilité
   */
  async detectVolatilityAnomalies(crypto: CryptoSymbol, period: TimePeriod) {
    console.log('\n🔍 DÉTECTION D\'ANOMALIES DE VOLATILITÉ');
    console.log('='.repeat(50));
    console.log(`Crypto: ${crypto.toUpperCase()} | Période: ${period}`);
    console.log('='.repeat(50));

    try {
      const response = await this.provider.fetchPriceData(crypto, period);

      if (!response.success || !response.data) {
        throw new Error(response.error);
      }

      const priceData = response.data;
      const prices = priceData.map(d => d.price);

      // Calculer les returns
      const logReturns = VolatilityCalculator.calculateLogReturns(prices);

      // Analyser les rendements extrêmes
      const mean = VolatilityCalculator.calculateMean(logReturns);
      const std = VolatilityCalculator.calculateStandardDeviation(logReturns);

      const threshold = 2; // 2 écarts-types
      const anomalies = logReturns
        .map((r, idx) => ({ return: r, index: idx, zscore: Math.abs((r - mean) / std) }))
        .filter(a => a.zscore > threshold)
        .sort((a, b) => b.zscore - a.zscore);

      console.log(`\nSeuil de détection: ${threshold} écarts-types`);
      console.log(`Nombre d'anomalies détectées: ${anomalies.length}/${logReturns.length}`);

      if (anomalies.length > 0) {
        console.log(`\nTop 5 anomalies:`);
        anomalies.slice(0, 5).forEach((a, idx) => {
          const date = new Date(priceData[a.index + 1].timestamp);
          console.log(`  ${idx + 1}. Z-score: ${a.zscore.toFixed(2)} | Return: ${(a.return * 100).toFixed(2)}% | Date: ${date.toLocaleDateString('fr-FR')}`);
        });
      } else {
        console.log('\n✓ Aucune anomalie détectée');
      }

      // Statistiques
      const diagnostics = DVOLCalculator.calculateDiagnostics(priceData, 'ewma');
      console.log('\n' + '-'.repeat(50));
      console.log('📊 DIAGNOSTICS');
      console.log(`Asymétrie (Skewness): ${diagnostics.skewness.toFixed(4)}`);
      console.log(`Aplatissement (Kurtosis): ${diagnostics.kurtosis.toFixed(4)}`);

      if (diagnostics.kurtosis > 3) {
        console.log('⚠  Attention: Kurtosis élevé = queue grasse (mouvements extrêmes fréquents)');
      }
    } catch (error) {
      console.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
}

/**
 * Exemple d'utilisation
 */
async function main() {
  const analyzer = new CryptoVolatilityAnalyzer();

  // 1. Comparaison multi-crypto
  await analyzer.analyzeMultipleCryptos(['bitcoin', 'solana'], '30d', 'ewma');

  // 2. Comparaison des méthodes DVOL
  await analyzer.compareDVOLMethods('bitcoin', '30d');

  // 3. Détection d'anomalies
  await analyzer.detectVolatilityAnomalies('solana', '30d');

  console.log('\n✓ Analyse complète terminée!\n');
}

main().catch(error => {
  console.error('Erreur:', error);
  process.exit(1);
});
