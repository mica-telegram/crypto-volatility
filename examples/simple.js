/**
 * Exemple Simple - Utilisation basique de crypto-volatility
 *
 * Cet exemple montre l'usage le plus simple et direct de la librairie
 * pour calculer rapidement la volatilité et le DVOL
 */
import { DVOLCalculator } from '../src/calculators/dvol.js';
import { VolatilityCalculator } from '../src/calculators/volatility.js';
import { CoinGeckoProvider } from '../src/providers/coingecko.js';
async function calculateVolatility(crypto, period) {
    try {
        // 1. Récupérer les données
        const provider = new CoinGeckoProvider();
        const response = await provider.fetchPriceData(crypto, period);
        if (!response.success || !response.data) {
            throw new Error(response.error);
        }
        // 2. Calculer la volatilité
        const volatility = VolatilityCalculator.calculateMetrics(response.data, period);
        // 3. Calculer le DVOL
        const dvol = DVOLCalculator.calculateDVOL(response.data, 'ewma');
        // 4. Afficher les résultats
        console.log(`\n📊 Volatilité pour ${crypto.toUpperCase()} (${period})`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`Volatilité: ${volatility.volatility.toFixed(2)}%`);
        console.log(`Volatilité Annualisée: ${volatility.annualizedVolatility.toFixed(2)}%`);
        console.log(`DVOL (EWMA): ${dvol.dvol.toFixed(2)}%`);
        console.log(`Index DVOL: ${dvol.dvolIndex.toFixed(1)}/100`);
        console.log(`Confiance: ${dvol.confidence.toFixed(1)}%`);
        console.log(`Points de données: ${response.data.length}`);
        console.log(`\n`);
        return { volatility, dvol };
    }
    catch (error) {
        console.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        throw error;
    }
}
// Exemple d'utilisation
async function main() {
    try {
        // Bitcoin sur 30 jours
        await calculateVolatility('bitcoin', '30d');
        // Solana sur 30 jours
        await calculateVolatility('solana', '30d');
    }
    catch (error) {
        process.exit(1);
    }
}
main();
//# sourceMappingURL=simple.js.map