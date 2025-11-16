import type { PriceData, VolatilityMetrics } from '../types.js';

export class VolatilityCalculator {
  /**
   * Calcule les rendements logarithmiques
   */
  static calculateLogReturns(prices: readonly number[]): number[] {
    if (prices.length < 2) {
      throw new Error('Need at least 2 price points to calculate returns');
    }

    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      if (prices[i - 1] <= 0 || prices[i] <= 0) {
        throw new Error('Prices must be positive');
      }
      const logReturn = Math.log(prices[i] / prices[i - 1]);
      returns.push(logReturn);
    }
    return returns;
  }

  /**
   * Calcule la moyenne arithmétique
   */
  static calculateMean(values: readonly number[]): number {
    if (values.length === 0) {
      throw new Error('Cannot calculate mean of empty array');
    }
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * Calcule la variance (non biaisée)
   */
  static calculateVariance(values: readonly number[]): number {
    if (values.length < 2) {
      throw new Error('Need at least 2 values to calculate variance');
    }

    const mean = this.calculateMean(values);
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    
    // Variance non biaisée (division par n-1)
    return squaredDifferences.reduce((sum, diff) => sum + diff, 0) / (values.length - 1);
  }

  /**
   * Calcule l'écart-type (volatilité)
   */
  static calculateStandardDeviation(values: readonly number[]): number {
    return Math.sqrt(this.calculateVariance(values));
  }

  /**
   * Annualise la volatilité
   */
  static annualizeVolatility(volatility: number, periodsPerYear: number): number {
    if (periodsPerYear <= 0) {
      throw new Error('Periods per year must be positive');
    }
    return volatility * Math.sqrt(periodsPerYear);
  }

  /**
   * Détermine le nombre de périodes par an selon la fréquence des données
   */
  static getPeriodsPerYear(period: string, dataPoints: number): number {
    switch (period) {
      case '1d':
        // Pour 1 jour, on assume des données horaires
        return 365 * 24;
      case '30d':
        // Pour 30 jours, on assume des données quotidiennes
        return 365;
      case '365d':
        // Pour 365 jours, données quotidiennes
        return 365;
      default:
        // Estimation basée sur le nombre de points de données
        return Math.min(365, dataPoints * 12);
    }
  }

  /**
   * Calcule toutes les métriques de volatilité
   */
  static calculateMetrics(
    priceData: readonly PriceData[],
    period: string
  ): VolatilityMetrics {
    if (priceData.length < 2) {
      throw new Error('Need at least 2 price points');
    }

    const prices = priceData.map(data => data.price);
    const logReturns = this.calculateLogReturns(prices);
    
    const variance = this.calculateVariance(logReturns);
    const volatility = Math.sqrt(variance);
    
    const periodsPerYear = this.getPeriodsPerYear(period, logReturns.length);
    const annualizedVolatility = this.annualizeVolatility(volatility, periodsPerYear);
    
    return {
      volatility: volatility * 100, // En pourcentage
      variance: variance * 10000, // En points de base
      annualizedVolatility: annualizedVolatility * 100, // En pourcentage
    };
  }
}
