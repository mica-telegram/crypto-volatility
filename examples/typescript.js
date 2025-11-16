"use strict";
n;
nimport;
{
    CoinGeckoProvider;
}
from;
'../src/providers/coingecko.js';
nimport;
{
    VolatilityCalculator;
}
from;
'../src/calculators/volatility.js';
nimport;
{
    DVOLCalculator;
}
from;
'../src/calculators/dvol.js';
nimport;
type;
{
    n;
    CryptoSymbol, ;
    n;
    TimePeriod, ;
    n;
    DVOLMethod, ;
    n;
    VolatilityMetrics, ;
    n;
    DVOLResult, ;
    n;
    PriceData, ;
    n;
}
from;
'../src/types.js';
n;
n; /**\n * Interface pour les résultats d'analyse complets\n */
ninterface;
VolatilityAnalysisResult;
{
    n;
    crypto: CryptoSymbol;
    n;
    period: TimePeriod;
    n;
    dataPoints: number;
    n;
    volatility: VolatilityMetrics;
    n;
    dvol: DVOLResult;
    n;
    analysis: {
        n;
        isHighVolatility: boolean;
        n;
        trend: 'increasing' | 'decreasing' | 'stable';
        n;
        recommendation: string;
        n;
    }
    ;
    n;
}
n;
n; /**\n * Classe pour analyser complètement la volatilité\n */
nclass;
TypedVolatilityAnalyzer;
{
    n;
    provider: CoinGeckoProvider;
    n;
    n;
    constructor();
    {
        n;
        this.provider = new CoinGeckoProvider();
        n;
    }
    n;
    n; /**\n   * Analyse complète avec types TypeScript\n   */
    n;
    async;
    analyzeWithTypes(n, crypto, CryptoSymbol, n, period, TimePeriod, n, dvolMethod, DVOLMethod = 'ewma', n);
    Promise < VolatilityAnalysisResult > { n };
} // Récupérer les données avec gestion de type stricte\n    const priceResponse = await this.provider.fetchPriceData(crypto, period);\n\n    if (!priceResponse.success || !priceResponse.data) {\n      throw new Error(`Failed to fetch data for ${crypto}: ${priceResponse.error}`);\n    }\n\n    const priceData: readonly PriceData[] = priceResponse.data;\n\n    // Calculer les métriques\n    const volatility: VolatilityMetrics = VolatilityCalculator.calculateMetrics(\n      priceData,\n      period\n    );\n\n    const dvol: DVOLResult = DVOLCalculator.calculateDVOL(priceData, dvolMethod);\n\n    // Analyse des résultats\n    const analysis = this.analyzeResults(volatility, dvol, dvolMethod);\n\n    return {\n      crypto,\n      period,\n      dataPoints: priceData.length,\n      volatility,\n      dvol,\n      analysis,\n    };\n  }\n\n  /**\n   * Analyse les résultats pour générer des insights\n   */\n  private analyzeResults(\n    volatility: VolatilityMetrics,\n    dvol: DVOLResult,\n    method: DVOLMethod\n  ): VolatilityAnalysisResult['analysis'] {\n    const vol = dvol.dvol;\n    const isHighVolatility = vol > 50; // Seuil arbitraire\n    const trend: VolatilityAnalysisResult['analysis']['trend'] = (\n      volatility.annualizedVolatility > 100 ? 'increasing' :\n      volatility.annualizedVolatility < 30 ? 'decreasing' :\n      'stable'\n    );\n\n    const recommendation = this.generateRecommendation(\n      isHighVolatility,\n      dvol.confidence,\n      method\n    );\n\n    return { isHighVolatility, trend, recommendation };\n  }\n\n  /**\n   * Génère une recommandation basée sur les métriques\n   */\n  private generateRecommendation(\n    isHighVolatility: boolean,\n    confidence: number,\n    method: DVOLMethod\n  ): string {\n    if (confidence < 70) {\n      return `Données insuffisantes avec la méthode ${method} (confiance: ${confidence.toFixed(1)}%)`;\n    }\n\n    if (isHighVolatility && confidence > 80) {\n      return 'Volatilité élevée détectée - Considérez des positions défensives';\n    }\n\n    if (!isHighVolatility && confidence > 80) {\n      return 'Volatilité stable - Environnement favorable pour le trading';\n    }\n\n    return 'Analyse inconclusive - Attendez plus de données';\n  }\n\n  /**\n   * Valide les paramètres d'entrée\n   */\n  validateInputs(crypto: CryptoSymbol, period: TimePeriod): void {\n    const validCryptos: CryptoSymbol[] = ['bitcoin', 'solana'];\n    const validPeriods: TimePeriod[] = ['1d', '30d', '365d'];\n\n    if (!validCryptos.includes(crypto)) {\n      throw new Error(`Crypto invalide: ${crypto}. Doit être l'un de: ${validCryptos.join(', ')}`);\n    }\n\n    if (!validPeriods.includes(period)) {\n      throw new Error(`Période invalide: ${period}. Doit être l'un de: ${validPeriods.join(', ')}`);\n    }\n  }\n}\n\n/**\n * Interface pour les résultats de comparaison\n */\ninterface ComparisonResult {\n  crypto1: VolatilityAnalysisResult;\n  crypto2: VolatilityAnalysisResult;\n  comparison: {\n    dvolDifference: number;\n    percentageDifference: number;\n    moreVolatile: CryptoSymbol;\n  };\n}\n\n/**\n * Fonction de comparaison fortement typée\n */\nasync function compareVolatility(\n  analyzer: TypedVolatilityAnalyzer,\n  crypto1: CryptoSymbol,\n  crypto2: CryptoSymbol,\n  period: TimePeriod = '30d',\n  method: DVOLMethod = 'ewma'\n): Promise<ComparisonResult> {\n  // Valider les inputs\n  analyzer.validateInputs(crypto1, period);\n  analyzer.validateInputs(crypto2, period);\n\n  // Analyser les deux cryptos\n  const [result1, result2] = await Promise.all([\n    analyzer.analyzeWithTypes(crypto1, period, method),\n    analyzer.analyzeWithTypes(crypto2, period, method),\n  ]);\n\n  // Comparer\n  const dvol1 = result1.dvol.dvol;\n  const dvol2 = result2.dvol.dvol;\n  const difference = Math.abs(dvol1 - dvol2);\n  const percentageDiff = (difference / Math.min(dvol1, dvol2)) * 100;\n\n  return {\n    crypto1: result1,\n    crypto2: result2,\n    comparison: {\n      dvolDifference: difference,\n      percentageDifference: percentageDiff,\n      moreVolatile: dvol1 > dvol2 ? crypto1 : crypto2,\n    },\n  };\n}\n\n/**\n * Exemple d'utilisation avec types complets\n */\nasync function main(): Promise<void> {\n  const analyzer = new TypedVolatilityAnalyzer();\n\n  console.log('📊 EXEMPLE TYPESCRIPT - TYPED VOLATILITY ANALYSIS\\n');\n\n  // Analyse unique\n  console.log('1️⃣ Analyse Bitcoin\\n');\n  const btcAnalysis = await analyzer.analyzeWithTypes('bitcoin', '30d', 'ewma');\n\n  console.log(`Crypto: ${btcAnalysis.crypto.toUpperCase()}`);\n  console.log(`Période: ${btcAnalysis.period}`);\n  console.log(`Points de données: ${btcAnalysis.dataPoints}`);\n  console.log(`\\nVolatilité: ${btcAnalysis.volatility.volatility.toFixed(2)}%`);\n  console.log(`DVOL: ${btcAnalysis.dvol.dvol.toFixed(2)}%`);\n  console.log(`Confiance: ${btcAnalysis.dvol.confidence.toFixed(1)}%`);\n  console.log(`\\nAnalyse:`);\n  console.log(`  • Haute volatilité? ${btcAnalysis.analysis.isHighVolatility ? 'Oui' : 'Non'}`);\n  console.log(`  • Tendance: ${btcAnalysis.analysis.trend}`);\n  console.log(`  • Recommandation: ${btcAnalysis.analysis.recommendation}`);\n\n  // Comparaison\n  console.log('\\n2️⃣ Comparaison Bitcoin vs Solana\\n');\n  const comparison = await compareVolatility(analyzer, 'bitcoin', 'solana', '30d', 'ewma');\n\n  console.log(`${comparison.crypto1.crypto.toUpperCase()} DVOL: ${comparison.crypto1.dvol.dvol.toFixed(2)}%`);\n  console.log(`${comparison.crypto2.crypto.toUpperCase()} DVOL: ${comparison.crypto2.dvol.dvol.toFixed(2)}%`);\n  console.log(`\\nDifférence: ${comparison.comparison.dvolDifference.toFixed(2)}%`);\n  console.log(`Pourcentage: ${comparison.comparison.percentageDifference.toFixed(1)}%`);\n  console.log(`Plus volatil: ${comparison.comparison.moreVolatile.toUpperCase()}`);\n\n  console.log('\\n✓ Analyse complète terminée!\\n');\n}\n\n// Exécution\nmain().catch(error => {\n  console.error('Erreur:', error instanceof Error ? error.message : String(error));\n  process.exit(1);\n});\n
//# sourceMappingURL=typescript.js.map