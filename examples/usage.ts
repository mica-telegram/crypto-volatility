/**
 * Exemple d'utilisation de la librairie crypto-volatility
 * 
 * Cet exemple montre comment:
 * 1. Récupérer les données de prix via CoinGecko
 * 2. Calculer les métriques de volatilité
 * 3. Calculer le DVOL avec différentes méthodes
 * 4. Afficher les résultats
 */

import { DVOLCalculator } from '../src/calculators/dvol.js';
import { VolatilityCalculator } from '../src/calculators/volatility.js';
import { CoinGeckoProvider } from '../src/providers/coingecko.js';
import type { CryptoSymbol, DVOLMethod, TimePeriod } from '../src/types.js';

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

  static formatDate(date: Date): string {
    return date.toLocaleString('fr-FR');
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
    Formatter.separator('CRYPTO VOLATILITY - EXEMPLE D\'UTILISATION');

    // 1. Initialisation du fournisseur CoinGecko
    console.log('📡 Initialisation du fournisseur CoinGecko...\n');
    const provider = new CoinGeckoProvider();

    // 2. Configuration des paramètres
    const crypto: CryptoSymbol = 'bitcoin';
    const period: TimePeriod = '30d';
    const dvolMethods: DVOLMethod[] = ['simple', 'ewma', 'garch'];

    console.log(`Configuration:`);
    console.log(`  • Crypto: ${crypto.toUpperCase()}`);
    console.log(`  • Période: ${period}`);
    console.log(`  • Méthodes DVOL: ${dvolMethods.join(', ').toUpperCase()}`);

    // 3. Récupération des données de prix
    Formatter.separator('RÉCUPÉRATION DES DONNÉES DE PRIX');

    console.log(`Récupération des données depuis ${provider.getName()}...`);
    const priceResponse = await provider.fetchPriceData(crypto, period);

    if (!priceResponse.success || !priceResponse.data) {
      throw new Error(priceResponse.error || 'Erreur lors de la récupération des données');
    }

    const priceData = priceResponse.data;
    console.log(`✓ ${priceData.length} points de données récupérés`);

    // Affichage des informations sur les données
    const prices = priceData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    Formatter.subsection('Statistiques des Prix');
    console.log(`  Prix minimum: $${minPrice.toFixed(2)}`);
    console.log(`  Prix maximum: $${maxPrice.toFixed(2)}`);
    console.log(`  Prix moyen: $${avgPrice.toFixed(2)}`);
    console.log(`  Plage: $${(maxPrice - minPrice).toFixed(2)} (${Formatter.formatPercentage((maxPrice - minPrice) / minPrice * 100)})`);

    // 4. Calcul des métriques de volatilité
    Formatter.separator('CALCUL DE LA VOLATILITÉ');

    console.log('Calcul des métriques de volatilité standard...');
    const volatilityMetrics = VolatilityCalculator.calculateMetrics(priceData, period);

    Formatter.subsection('Résultats de Volatilité');
    console.log(`  Volatilité: ${Formatter.formatPercentage(volatilityMetrics.volatility)}`);
    console.log(`  Variance: ${Formatter.formatNumber(volatilityMetrics.variance)}`);
    console.log(`  Volatilité Annualisée: ${Formatter.formatPercentage(volatilityMetrics.annualizedVolatility)}`);

    // 5. Calcul du DVOL avec différentes méthodes
    Formatter.separator('CALCUL DU DVOL (Realized Volatility)');

    const dvolResults = new Map<DVOLMethod, any>();

    for (const method of dvolMethods) {
      console.log(`Calcul DVOL avec méthode ${method.toUpperCase()}...`);
      
      try {
        const result = DVOLCalculator.calculateDVOL(priceData, method, {
          windowSize: 20,
          ewmaLambda: 0.94,
        });
        dvolResults.set(method, result);
      } catch (error) {
        console.error(`  ✗ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }

    // Affichage des résultats DVOL
    Formatter.subsection('Résultats DVOL par Méthode');

    for (const [method, result] of dvolResults) {
      console.log(`\n  ${method.toUpperCase()}:`);
      console.log(`    DVOL: ${Formatter.formatPercentage(result.dvol)}`);
      console.log(`    Index DVOL: ${Formatter.formatNumber(result.dvolIndex)}`);
      console.log(`    Confiance: ${Formatter.formatPercentage(result.confidence)}`);
      console.log(`    Points de données: ${result.dataPoints}`);
      console.log(`    Calculé à: ${Formatter.formatDate(result.calculatedAt)}`);
    }

    // 6. Comparaison des méthodes
    Formatter.separator('COMPARAISON DES MÉTHODES');

    if (dvolResults.size > 1) {
      Formatter.subsection('Analyse Comparative');
      
      const values = Array.from(dvolResults.values());
      const dvolValues = values.map(r => r.dvol);
      const indexValues = values.map(r => r.dvolIndex);

      const dvolAvg = dvolValues.reduce((a, b) => a + b, 0) / dvolValues.length;
      const indexAvg = indexValues.reduce((a, b) => a + b, 0) / indexValues.length;
      
      const dvolStd = Math.sqrt(
        dvolValues.reduce((sum, v) => sum + Math.pow(v - dvolAvg, 2), 0) / dvolValues.length
      );

      console.log(`  DVOL moyen: ${Formatter.formatPercentage(dvolAvg)}`);
      console.log(`  DVOL écart-type: ${Formatter.formatPercentage(dvolStd)}`);
      console.log(`  Index DVOL moyen: ${Formatter.formatNumber(indexAvg)}`);
      console.log(`  Écart relatif: ${Formatter.formatPercentage((dvolStd / dvolAvg) * 100)}`);
    }

    // 7. Diagnostic DVOL
    Formatter.separator('DIAGNOSTICS DVOL');

    console.log('Calcul des indicateurs diagnostiques...');
    
    try {
      const diagnostics = DVOLCalculator.calculateDiagnostics(priceData, 'ewma');
      
      Formatter.subsection('Indicateurs Statistiques');
      console.log(`  Autocorrélation: ${Formatter.formatNumber(diagnostics.autocorrelation, 4)}`);
      console.log(`  Hétéroscédasticité: ${Formatter.formatNumber(diagnostics.heteroskedasticity, 4)}`);
      console.log(`  Asymétrie (Skewness): ${Formatter.formatNumber(diagnostics.skewness, 4)}`);
      console.log(`  Aplatissement (Kurtosis): ${Formatter.formatNumber(diagnostics.kurtosis, 4)}`);

      Formatter.subsection('Interprétation');
      if (Math.abs(diagnostics.autocorrelation) < 0.1) {
        console.log(`  ✓ Autocorrélation faible - rendements peu prévisibles`);
      } else {
        console.log(`  ⚠ Autocorrélation détectée - tendance possible`);
      }

      if (diagnostics.heteroskedasticity > 0.3) {
        console.log(`  ⚠ Hétéroscédasticité forte - volatilité changeante`);
      } else {
        console.log(`  ✓ Hétéroscédasticité modérée`);
      }

      if (Math.abs(diagnostics.skewness) > 0.5) {
        console.log(`  ⚠ Distribution asymétrique - tendance ${diagnostics.skewness > 0 ? 'positive' : 'négative'}`);
      } else {
        console.log(`  ✓ Distribution approximativement symétrique`);
      }

      if (diagnostics.kurtosis > 3) {
        console.log(`  ⚠ Aplatissement élevé - queue grasse (risque de mouvements extrêmes)`);
      } else {
        console.log(`  ✓ Distribution normale`);
      }
    } catch (error) {
      console.error(`Erreur dans le diagnostic: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    // 8. Exemple d'utilisation avec Solana
    Formatter.separator('EXEMPLE SUPPLÉMENTAIRE: SOLANA');

    console.log('Récupération des données pour Solana (7 jours)...');
    
    try {
      const solanaResponse = await provider.fetchPriceData('solana', '1d');
      
      if (!solanaResponse.success || !solanaResponse.data) {
        throw new Error(solanaResponse.error || 'Erreur lors de la récupération des données');
      }

      const solanaData = solanaResponse.data;
      console.log(`✓ ${solanaData.length} points de données pour Solana`);

      const solanaVolatility = VolatilityCalculator.calculateMetrics(solanaData, '1d');
      const solanaDvol = DVOLCalculator.calculateDVOL(solanaData, 'ewma');

      Formatter.subsection('Résultats pour Solana');
      console.log(`  Volatilité: ${Formatter.formatPercentage(solanaVolatility.volatility)}`);
      console.log(`  DVOL (EWMA): ${Formatter.formatPercentage(solanaDvol.dvol)}`);
      console.log(`  Index DVOL: ${Formatter.formatNumber(solanaDvol.dvolIndex)}`);

      Formatter.subsection('Comparaison Bitcoin vs Solana');
      const btcDvol = dvolResults.get('ewma')?.dvol || 0;
      console.log(`  Bitcoin DVOL: ${Formatter.formatPercentage(btcDvol)}`);
      console.log(`  Solana DVOL: ${Formatter.formatPercentage(solanaDvol.dvol)}`);
      console.log(`  Différence: ${Formatter.formatPercentage(Math.abs(btcDvol - solanaDvol.dvol))}`);
      
      const more_volatile = btcDvol > solanaDvol.dvol ? 'Bitcoin' : 'Solana';
      console.log(`  → ${more_volatile} est plus volatile`);
    } catch (error) {
      console.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    Formatter.separator('EXEMPLE TERMINÉ');
    console.log('\n✓ Exécution réussie!\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error instanceof Error ? error.message : 'Erreur inconnue');
    process.exit(1);
  }
}

// Exécution
main().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});
