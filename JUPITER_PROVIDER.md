# Jupiter Provider - Documentation d'Intégration

## Vue d'ensemble

Le provider **Jupiter** permet de récupérer les données de prix des cryptomonnaies (Bitcoin, Solana) via l'API Jupiter (https://www.jupiterapi.com/). Jupiter est un agrégateur de liquidité populaire dans l'écosystème Solana.

## Caractéristiques

- ✅ Récupération du prix actuel en temps réel
- ✅ Support des symboles: `bitcoin`, `solana`
- ✅ Gestion automatique du rate limiting
- ✅ Gestion d'erreurs complète
- ✅ Support des calculs de volatilité et DVOL
- ✅ Données simulées pour les prix historiques

## Installation

```bash
npm install
```

## Utilisation

### 1. Récupération du prix actuel

```typescript
import { JupiterProvider } from './src/providers/jupiter.js';

const provider = new JupiterProvider();

// Récupérer le prix actuel du Bitcoin
const priceResponse = await provider.getCurrentPrice('bitcoin');

if (priceResponse.success && priceResponse.data !== undefined) {
  console.log(`Bitcoin: $${priceResponse.data}`);
} else {
  console.error(`Erreur: ${priceResponse.error}`);
}
```

### 2. Récupération des données de prix avec calcul de volatilité

```typescript
import { JupiterProvider } from './src/providers/jupiter.js';
import { VolatilityCalculator } from './src/calculators/volatility.js';

const provider = new JupiterProvider();

// Récupérer les données de prix pour 30 jours
const priceData = await provider.fetchPriceData('bitcoin', '30d');

if (priceData.success && priceData.data) {
  // Calculer la volatilité
  const metrics = VolatilityCalculator.calculateMetrics(priceData.data, '30d');
  
  console.log(`Volatilité: ${metrics.volatility.toFixed(2)}%`);
  console.log(`Volatilité Annualisée: ${metrics.annualizedVolatility.toFixed(2)}%`);
  console.log(`Variance: ${metrics.variance.toFixed(2)}`);
}
```

### 3. Calcul du DVOL avec Jupiter

```typescript
import { JupiterProvider } from './src/providers/jupiter.js';
import { DVOLCalculator } from './src/calculators/dvol.js';

const provider = new JupiterProvider();

// Récupérer les données
const priceData = await provider.fetchPriceData('solana', '30d');

if (priceData.success && priceData.data) {
  // Calculer le DVOL avec la méthode EWMA
  const dvol = DVOLCalculator.calculateDVOL(priceData.data, 'ewma', {
    windowSize: 20,
    ewmaLambda: 0.94,
  });
  
  console.log(`DVOL: ${dvol.dvol.toFixed(2)}%`);
  console.log(`Index DVOL: ${dvol.dvolIndex.toFixed(2)}`);
  console.log(`Confiance: ${dvol.confidence.toFixed(2)}%`);
}
```

### 4. Comparaison avec CoinGecko

```typescript
import { JupiterProvider } from './src/providers/jupiter.js';
import { CoinGeckoProvider } from './src/providers/coingecko.js';
import { VolatilityCalculator } from './src/calculators/volatility.js';

const jupiterProvider = new JupiterProvider();
const coingeckoProvider = new CoinGeckoProvider();

// Récupérer les données depuis les deux providers
const jupiterData = await jupiterProvider.fetchPriceData('bitcoin', '30d');
const coingeckoData = await coingeckoProvider.fetchPriceData('bitcoin', '30d');

if (jupiterData.success && coingeckoData.success) {
  const jupiterVol = VolatilityCalculator.calculateMetrics(jupiterData.data!, '30d');
  const coingeckoVol = VolatilityCalculator.calculateMetrics(coingeckoData.data!, '30d');
  
  console.log(`Jupiter Volatilité: ${jupiterVol.volatility.toFixed(2)}%`);
  console.log(`CoinGecko Volatilité: ${coingeckoVol.volatility.toFixed(2)}%`);
  console.log(`Différence: ${Math.abs(jupiterVol.volatility - coingeckoVol.volatility).toFixed(2)}%`);
}
```

## Exemples

### Exécuter l'exemple complet

```bash
npm run example:jupiter
```

### Exécuter l'exemple simple

```bash
npm run example
```

## Configuration

Le provider Jupiter accepte une configuration optionnelle lors de l'initialisation:

```typescript
const provider = new JupiterProvider();

// Les paramètres par défaut:
// - Rate limiting: 500ms entre les requêtes
// - Timeout: 10000ms
// - Base URL: https://api.jupiterapi.com/api
```

## Symboles supportés

Le provider Jupiter supporte les symboles suivants:

- `bitcoin` - Bitcoin (BTC)
- `solana` - Solana (SOL)

## Périodes supportées

- `1d` - 1 jour (données horaires)
- `30d` - 30 jours (données quotidiennes)
- `365d` - 365 jours (données quotidiennes)

## Gestion des erreurs

```typescript
try {
  const response = await provider.fetchPriceData('bitcoin', '30d');
  
  if (!response.success) {
    console.error(`Erreur: ${response.error}`);
  } else {
    console.log(`Succès: ${response.data!.length} points de données`);
  }
} catch (error) {
  console.error('Erreur non gérée:', error);
}
```

## Limitations actuelles

⚠️ **Important**: L'API Jupiter fournie par https://www.jupiterapi.com/ est principalement orientée vers les prix de swap en temps réel. Les données historiques complètes ne sont pas directement disponibles via cette API.

**Workarounds implémentés:**
- Les prix historiques sont actuellement simulés/générés pour les calculs
- Pour les données réelles historiques, envisagez d'utiliser CoinGecko ou une autre API historique
- Le prix actuel est récupéré en temps réel via Jupiter

**Pour obtenir les vraies données historiques:**

1. **Combinez avec une autre API:**
```typescript
import { JupiterProvider } from './src/providers/jupiter.js';
import { CoinGeckoProvider } from './src/providers/coingecko.js';

// Utiliser CoinGecko pour les données historiques
const coingecko = new CoinGeckoProvider();
const historicalData = await coingecko.fetchPriceData('bitcoin', '30d');

// Utiliser Jupiter pour le prix actuel
const jupiter = new JupiterProvider();
const currentPrice = await jupiter.getCurrentPrice('bitcoin');
```

2. **Implémenter un cache persistant:**
```typescript
// Sauvegarder les prix quotidiens dans une base de données
// et utiliser Jupiter pour les mises à jour en temps réel
```

3. **Utiliser une autre source de données historiques:**
```typescript
// CoinGecko - Données historiques complètes
// Kraken API - Données OHLC historiques
// Binance API - Données tick historiques
```

## Performance

- Rate limiting: 500ms entre requêtes (limites Jupiter)
- Timeout: 10 secondes par requête
- Support du cache pour optimiser les performances

## Exemples complets

Voir le fichier `examples/jupiter.ts` pour un exemple complet montrant:
- Récupération du prix actuel
- Calcul de la volatilité
- Calcul du DVOL
- Comparaison avec CoinGecko
- Analyse multi-symboles
- Diagnostics statistiques

## Scripts npm disponibles

```bash
# Exécuter l'exemple Jupiter
npm run example:jupiter

# Exécuter tous les exemples
npm run example
npm run example:simple
npm run example:quickstart
npm run example:advanced
npm run example:typescript

# Builder le projet
npm run build

# Nettoyer les builds
npm run clean
```

## Contribution

Pour améliorer le provider Jupiter:

1. Intégrez les vraies données historiques de Jupiter si disponibles
2. Optimisez le rate limiting
3. Ajoutez plus de symboles supportés
4. Améliorez la gestion des erreurs

## Références

- Jupiter API: https://www.jupiterapi.com/
- Documentation: https://docs.jupiterapi.com/
- Solana: https://solana.com/
