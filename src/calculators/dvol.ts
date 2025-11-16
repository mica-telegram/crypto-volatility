import type {
  DVOLMethod,
  GARCHParams,
  PriceData
} from '../types.js';
import { VolatilityCalculator } from './volatility.js';

export interface DVOLOptions {
  readonly windowSize?: number;
  readonly ewmaLambda?: number;
  readonly garchParams?: GARCHParams;
  readonly annualizationFactor?: number;
}

export interface DVOLResult {
  readonly dvol: number;
  readonly dvolIndex: number;
  readonly confidence: number;
  readonly method: DVOLMethod;
  readonly dataPoints: number;
  readonly calculatedAt: Date;
}

export class DVOLCalculator {
  private static readonly DEFAULT_WINDOW_SIZE = 30;
  private static readonly DEFAULT_EWMA_LAMBDA = 0.94;
  private static readonly DEFAULT_GARCH_PARAMS: GARCHParams = {
    omega: 0.000001,
    alpha: 0.1,
    beta: 0.85,
  };
  private static readonly ANNUALIZATION_FACTOR = 365;

  /**
   * Calcule le DVOL avec la méthode spécifiée
   */
  static calculateDVOL(
    priceData: readonly PriceData[],
    method: DVOLMethod = 'ewma',
    options: DVOLOptions = {}
  ): DVOLResult {
    this.validateInput(priceData, method);

    const {
      windowSize = this.DEFAULT_WINDOW_SIZE,
      ewmaLambda = this.DEFAULT_EWMA_LAMBDA,
      garchParams = this.DEFAULT_GARCH_PARAMS,
      annualizationFactor = this.ANNUALIZATION_FACTOR,
    } = options;

    let dvol: number;
    let confidence: number;

    switch (method) {
      case 'simple':
        ({ dvol, confidence } = this.calculateSimpleDVOL(priceData, windowSize, annualizationFactor));
        break;
      case 'ewma':
        ({ dvol, confidence } = this.calculateEWMADVOL(priceData, ewmaLambda, annualizationFactor));
        break;
      case 'garch':
        ({ dvol, confidence } = this.calculateGARCHDVOL(priceData, garchParams, annualizationFactor));
        break;
      default:
        throw new Error(`Unsupported DVOL method: ${method}`);
    }

    // DVOL Index (normalisé sur une échelle 0-100)
    const dvolIndex = this.calculateDVOLIndex(dvol);

    return {
      dvol,
      dvolIndex,
      confidence,
      method,
      dataPoints: priceData.length,
      calculatedAt: new Date(),
    };
  }

  /**
   * Méthode Simple DVOL - Volatilité réalisée avec fenêtre glissante
   */
  private static calculateSimpleDVOL(
    priceData: readonly PriceData[],
    windowSize: number,
    annualizationFactor: number
  ): { dvol: number; confidence: number } {
    const prices = priceData.map(data => data.price);
    const logReturns = VolatilityCalculator.calculateLogReturns(prices);

    if (logReturns.length < windowSize) {
      throw new Error(`Insufficient data for window size ${windowSize}`);
    }

    // Calcul de la volatilité sur fenêtre glissante
    const volatilities: number[] = [];
    
    for (let i = windowSize - 1; i < logReturns.length; i++) {
      const window = logReturns.slice(i - windowSize + 1, i + 1);
      const variance = VolatilityCalculator.calculateVariance(window);
      const volatility = Math.sqrt(variance);
      volatilities.push(volatility);
    }

    // DVOL = moyenne des volatilités récentes
    const dvol = VolatilityCalculator.calculateMean(volatilities) * Math.sqrt(annualizationFactor) * 100;
    
    // Confiance basée sur la stabilité des mesures
    const volatilityStd = VolatilityCalculator.calculateStandardDeviation(volatilities);
    const confidence = Math.max(0, Math.min(100, 100 - (volatilityStd / VolatilityCalculator.calculateMean(volatilities)) * 100));

    return { dvol, confidence };
  }

  /**
   * Méthode EWMA DVOL - Exponentially Weighted Moving Average
   */
  private static calculateEWMADVOL(
    priceData: readonly PriceData[],
    lambda: number,
    annualizationFactor: number
  ): { dvol: number; confidence: number } {
    if (lambda <= 0 || lambda >= 1) {
      throw new Error('EWMA lambda must be between 0 and 1');
    }

    const prices = priceData.map(data => data.price);
    const logReturns = VolatilityCalculator.calculateLogReturns(prices);

    if (logReturns.length < 2) {
      throw new Error('Need at least 2 returns for EWMA calculation');
    }

    // Initialisation avec la première variance
    let ewmaVariance = Math.pow(logReturns[0], 2);
    const variances: number[] = [ewmaVariance];

    // Calcul EWMA récursif
    for (let i = 1; i < logReturns.length; i++) {
      ewmaVariance = lambda * ewmaVariance + (1 - lambda) * Math.pow(logReturns[i], 2);
      variances.push(ewmaVariance);
    }

    // DVOL = racine de la dernière variance EWMA, annualisée
    const dvol = Math.sqrt(ewmaVariance * annualizationFactor) * 100;

    // Confiance basée sur la convergence EWMA
    const recentVariances = variances.slice(-Math.min(10, variances.length));
    const varianceStability = this.calculateStability(recentVariances);
    const confidence = Math.max(0, Math.min(100, varianceStability));

    return { dvol, confidence };
  }

  /**
   * Méthode GARCH DVOL - Generalized Autoregressive Conditional Heteroskedasticity
   */
  private static calculateGARCHDVOL(
    priceData: readonly PriceData[],
    params: GARCHParams,
    annualizationFactor: number
  ): { dvol: number; confidence: number } {
    const { omega, alpha, beta } = params;

    // Validation des paramètres GARCH
    if (omega <= 0 || alpha < 0 || beta < 0 || alpha + beta >= 1) {
      throw new Error('Invalid GARCH parameters');
    }

    const prices = priceData.map(data => data.price);
    const logReturns = VolatilityCalculator.calculateLogReturns(prices);

    if (logReturns.length < 10) {
      throw new Error('Need at least 10 returns for GARCH calculation');
    }

    // Initialisation avec la variance inconditionnelle
    const unconditionalVariance = VolatilityCalculator.calculateVariance(logReturns);
    let variance = unconditionalVariance;
    
    const variances: number[] = [variance];
    const standardizedResiduals: number[] = [];

    // Modèle GARCH(1,1): σ²(t) = ω + α*ε²(t-1) + β*σ²(t-1)
    for (let i = 1; i < logReturns.length; i++) {
      const previousReturn = logReturns[i - 1];
      const previousVariance = variance;
      
      // Mise à jour de la variance conditionnelle
      variance = omega + alpha * Math.pow(previousReturn, 2) + beta * previousVariance;
      variances.push(variance);
      
      // Calcul des résidus standardisés pour diagnostics
      const standardizedResidual = logReturns[i] / Math.sqrt(variance);
      standardizedResiduals.push(standardizedResidual);
    }

    // DVOL = racine de la dernière variance conditionnelle, annualisée
    const dvol = Math.sqrt(variance * annualizationFactor) * 100;

    // Confiance basée sur la qualité du modèle GARCH
    const confidence = this.calculateGARCHConfidence(standardizedResiduals, variances);

    return { dvol, confidence };
  }

  /**
   * Calcule l'indice DVOL normalisé (0-100)
   */
  private static calculateDVOLIndex(dvol: number): number {
    // Normalisation basée sur des seuils historiques typiques pour les cryptos
    const minDVOL = 10; // 10% volatilité minimale
    const maxDVOL = 200; // 200% volatilité maximale
    
    const normalizedIndex = ((dvol - minDVOL) / (maxDVOL - minDVOL)) * 100;
    return Math.max(0, Math.min(100, normalizedIndex));
  }

  /**
   * Calcule la stabilité d'une série de variances
   */
  private static calculateStability(variances: readonly number[]): number {
    if (variances.length < 2) return 50;

    const mean = VolatilityCalculator.calculateMean(variances);
    const std = VolatilityCalculator.calculateStandardDeviation(variances);
    const coefficientOfVariation = std / mean;
    
    // Plus le coefficient de variation est faible, plus la stabilité est élevée
    return Math.max(0, Math.min(100, 100 - coefficientOfVariation * 100));
  }

  /**
   * Calcule la confiance du modèle GARCH
   */
  private static calculateGARCHConfidence(
    standardizedResiduals: readonly number[],
    variances: readonly number[]
  ): number {
    if (standardizedResiduals.length === 0) return 50;

    // Test de normalité des résidus standardisés (approximation)
    const residualMean = VolatilityCalculator.calculateMean(standardizedResiduals);
    const residualStd = VolatilityCalculator.calculateStandardDeviation(standardizedResiduals);
    
    // Les résidus devraient être centrés sur 0 avec écart-type proche de 1
    const meanDeviation = Math.abs(residualMean);
    const stdDeviation = Math.abs(residualStd - 1);
    
    // Score de qualité basé sur la proximité aux valeurs théoriques
    const qualityScore = Math.max(0, 100 - (meanDeviation + stdDeviation) * 50);
    
    // Stabilité des variances
    const varianceStability = this.calculateStability(variances);
    
    // Confiance combinée
    return (qualityScore + varianceStability) / 2;
  }

  /**
   * Validation des données d'entrée
   */
  private static validateInput(priceData: readonly PriceData[], method: DVOLMethod): void {
    if (!Array.isArray(priceData) || priceData.length === 0) {
      throw new Error('Price data cannot be empty');
    }

    if (priceData.length < 2) {
      throw new Error('Need at least 2 price points for DVOL calculation');
    }

    const minDataPoints = method === 'garch' ? 10 : method === 'ewma' ? 5 : 2;
    if (priceData.length < minDataPoints) {
      throw new Error(`${method.toUpperCase()} method requires at least ${minDataPoints} data points`);
    }

    // Vérification de la validité des prix
    const invalidPrices = priceData.filter(
      data => !Number.isFinite(data.price) || data.price <= 0
    );

    if (invalidPrices.length > 0) {
      throw new Error('All prices must be positive finite numbers');
    }
  }

  /**
   * Calcule des métriques de diagnostic pour le DVOL
   */
  static calculateDiagnostics(
    priceData: readonly PriceData[],
    method: DVOLMethod,
    options: DVOLOptions = {}
  ): {
    readonly autocorrelation: number;
    readonly heteroskedasticity: number;
    readonly skewness: number;
    readonly kurtosis: number;
  } {
    const prices = priceData.map(data => data.price);
    const logReturns = VolatilityCalculator.calculateLogReturns(prices);

    return {
      autocorrelation: this.calculateAutocorrelation(logReturns),
      heteroskedasticity: this.calculateHeteroskedasticity(logReturns),
      skewness: this.calculateSkewness(logReturns),
      kurtosis: this.calculateKurtosis(logReturns),
    };
  }

  /**
   * Calcule l'autocorrélation des rendements
   */
  private static calculateAutocorrelation(returns: readonly number[], lag: number = 1): number {
    if (returns.length <= lag) return 0;

    const n = returns.length - lag;
    const mean = VolatilityCalculator.calculateMean(returns);
    
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (returns[i] - mean) * (returns[i + lag] - mean);
    }

    for (let i = 0; i < returns.length; i++) {
      denominator += Math.pow(returns[i] - mean, 2);
    }

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Test d'hétéroscédasticité (ARCH effect)
   */
  private static calculateHeteroskedasticity(returns: readonly number[]): number {
    const squaredReturns = returns.map(r => r * r);
    return this.calculateAutocorrelation(squaredReturns, 1);
  }

  /**
   * Calcule l'asymétrie (skewness)
   */
  private static calculateSkewness(returns: readonly number[]): number {
    const mean = VolatilityCalculator.calculateMean(returns);
    const std = VolatilityCalculator.calculateStandardDeviation(returns);
    
    if (std === 0) return 0;

    const n = returns.length;
    const skewness = returns.reduce((sum, r) => {
      return sum + Math.pow((r - mean) / std, 3);
    }, 0) / n;

    return skewness;
  }

    /**
     * Calcule l'aplatissement (kurtosis)
     */
    private static calculateKurtosis(returns: readonly number[]): number {
      const mean = VolatilityCalculator.calculateMean(returns);
      const std = VolatilityCalculator.calculateStandardDeviation(returns);
      
      if (std === 0) return 0;
  
      const n = returns.length;
      const kurtosis = returns.reduce((sum, r) => {
        return sum + Math.pow((r - mean) / std, 4);
      }, 0) / n - 3;
  
      return kurtosis;
    }
  }