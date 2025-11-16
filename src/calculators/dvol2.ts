import { PriceData } from '../types';
import { VolatilityCalculator } from './volatility';

export class DVOLCalculator {
  /**
   * Calcule le DVOL (Decentralized Volatility Index)
   * Basé sur la volatilité implicite des options ou volatilité réalisée
   */
  static calculateDVOL(priceData: PriceData[], windowSize: number = 30): number {
    if (priceData.length < windowSize) {
      throw new Error(`Insufficient data points. Need at least ${windowSize}, got ${priceData.length}`);
    }

    // Utilise une fenêtre glissante pour calculer la volatilité
    const volatilities: number[] = [];
    
    for (let i = windowSize; i <= priceData.length; i++) {
      const window = priceData.slice(i - windowSize, i);
      const prices = window.map(data => data.price);
      const logReturns = VolatilityCalculator.calculateLogReturns(prices);
      const volatility = VolatilityCalculator.calculateVolatility(logReturns);
      volatilities.push(volatility);
    }

    // DVOL est la moyenne pondérée des volatilités récentes
    const weights = volatilities.map((_, index) => Math.exp(-0.1 * (volatilities.length - index - 1)));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    const weightedVolatility = volatilities.reduce((sum, vol, index) => {
      return sum + (vol * weights[index]);
    }, 0) / totalWeight;

    // Annualise et convertit en pourcentage
    return weightedVolatility * Math.sqrt(365) * 100;
  }

  /**
   * Calcule le DVOL avec différentes méthodes
   */
  static calculateAdvancedDVOL(priceData: PriceData[], method: 'simple' | 'ewma' | 'garch' = 'ewma'): number {
    switch (method) {
      case 'simple':
        return this.calculateDVOL(priceData);
      
      case 'ewma':
        return this.calculateEWMAVolatility(priceData);
      
      case 'garch':
        return this.calculateGARCHVolatility(priceData);
      
      default:
        throw new Error(`Unsupported DVOL method: ${method}`);
    }
  }

  /**
   * Calcule la volatilité EWMA (Exponentially Weighted Moving Average)
   */
  private static calculateEWMAVolatility(priceData: PriceData[], lambda: number = 0.94): number {
    const prices = priceData.map(data => data.price);
    const logReturns = VolatilityCalculator.calculateLogReturns(prices);
    
    let ewmaVariance = Math.pow(logReturns[0], 2);
    
    for (let i = 1; i < logReturns.length; i++) {
      ewmaVariance = lambda * ewmaVariance + (1 - lambda) * Math.pow(logReturns[i], 2);
    }
    
    return Math.sqrt(ewmaVariance * 365) * 100;
  }

  /**
   * Calcule la volatilité GARCH simplifiée
   */
  private static calculateGARCHVolatility(priceData: PriceData[]): number {
    const prices = priceData.map(data => data.price);
    const logReturns = VolatilityCalculator.calculateLogReturns(prices);
    
    // Paramètres GARCH(1,1) simplifiés
    const omega = 0.000001;
    const alpha = 0.1;
    const beta = 0.85;
    
    let variance = VolatilityCalculator.calculateVariance(logReturns);
    
    for (let i = 1; i < logReturns.length; i++) {
      variance = omega +