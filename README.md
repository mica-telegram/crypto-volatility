# crypto-volatility

Une librairie TypeScript moderne pour calculer la volatilité et le DVOL (Implied Volatility) pour Bitcoin et Solana, avec support de multiples fournisseurs de données.

## ✨ Caractéristiques

- 📊 Calcul de la volatilité (standard, annualisée)
- 📈 Calcul du DVOL avec plusieurs méthodes (simple, EWMA, GARCH)
- 🔄 Support de multiples providers de données:
  - **CoinGecko** - API libre avec historique complet
  - **Jupiter** - Agrégateur de liquidité Solana avec prix en temps réel
- 🎯 Support des crypto: Bitcoin, Solana
- ⏱️ Périodes flexibles: 1 jour, 30 jours, 365 jours
- 🔍 Diagnostics statistiques avancés
- 💎 TypeScript strict avec types complets
- ⚡ Performance optimisée avec gestion du rate limiting

## 📦 Installation

```bash
npm install crypto-volatility
```

### Prérequis

- Node.js >= 24.0.0
- TypeScript >= 5.3.0

## 🚀 Démarrage rapide

### 1. Calcul de la volatilité simple

```typescript
import { CoinGeckoProvider } from './src/providers/coingecko.js';
import { VolatilityCalculator } from './src/calculators/volatility.js';

const provider = new CoinGeckoProvider();

// Récupérer les données de prix
const priceData = await provider.fetchPriceData('bitcoin', '30d');

if (priceData.success && priceData.data) {
  // Calculer la volatilité
  const metrics = VolatilityCalculator.calculateMetrics(priceData.data, '30d');
  
  console.log(`Volatilité: ${metrics.volatility.toFixed(2)}%`);
  console.log(`Volatilité Annualisée: ${metrics.annualizedVolatility.toFixed(2)}%`);
}
```

### 2. Calcul du DVOL

```typescript
import { DVOLCalculator } from './src/calculators/dvol.js';

// Après avoir obtenu les données de prix...
const dvol = DVOLCalculator.calculateDVOL(priceData.data, 'ewma', {
  windowSize: 20,
  ewmaLambda: 0.94,
});

console.log(`DVOL (EWMA): ${dvol.dvol.toFixed(2)}%`);
console.log(`Index DVOL: ${dvol.dvolIndex.toFixed(2)}`);
```

### 3. Utiliser le provider Jupiter

```typescript
import { JupiterProvider } from './src/providers/jupiter.js';

const provider = new JupiterProvider();

// Récupérer le prix actuel
const currentPrice = await provider.getCurrentPrice('bitcoin');

// Récupérer les données de prix pour calculs
const priceData = await provider.fetchPriceData('solana', '30d');
```

## 📊 Providers disponibles

### CoinGecko Provider

L'API CoinGecko fournie des données historiques complètes et gratuites.

```typescript
import { CoinGeckoProvider } from './src/providers/coingecko.js';

const provider = new CoinGeckoProvider();

// Récupérer les données
const response = await provider.fetchPriceData('bitcoin', '365d');

if (response.success && response.data) {
  console.log(`${response.data.length} points de données récupérés`);
}
```

**Avantages:**
- ✅ API gratuite
- ✅ Données historiques complètes
- ✅ Pas de limite d'utilisation stricte
- ✅ Couvre 36+ tokens

**Limitations:**
- Rate limiting: 1 requête par 1.1 secondes

### Jupiter Provider

Jupiter est un agrégateur de liquidité populaire dans l'écosystème Solana.

```typescript
import { JupiterProvider } from './src/providers/jupiter.js';

const provider = new JupiterProvider();

// Récupérer le prix actuel
const price = await provider.getCurrentPrice('bitcoin');

// Récupérer les données de prix
const response = await provider.fetchPriceData('solana', '30d');
```

**Avantages:**
- ✅ Prix en temps réel
- ✅ Optimisé pour Solana
- ✅ Agrégation de liquidité
- ✅ Rate limiting plus léger (500ms)

**Limitations:**
- Données historiques simulées (voir [JUPITER_PROVIDER.md](./JUPITER_PROVIDER.md))

**Pour plus d'informations:** Voir [JUPITER_PROVIDER.md](./JUPITER_PROVIDER.md)

## 🧮 Calculateurs

### VolatilityCalculator

Calcule les métriques de volatilité standard.

```typescript
import { VolatilityCalculator } from './src/calculators/volatility.js';

const metrics = VolatilityCalculator.calculateMetrics(priceData, '30d');

// Résultat:
// {
//   volatility: 45.23,           // Volatilité simple en %
//   variance: 2045.75,           // Variance en points de base²
//   annualizedVolatility: 156.78 // Volatilité annualisée en %
// }
```

### DVOLCalculator

Calcule la volatilité réalisée (DVOL) avec plusieurs méthodes.

```typescript
import { DVOLCalculator } from './src/calculators/dvol.js';

// Méthode simple
const simple = DVOLCalculator.calculateDVOL(priceData, 'simple');

// Méthode EWMA (Exponentially Weighted Moving Average)
const ewma = DVOLCalculator.calculateDVOL(priceData, 'ewma', {
  windowSize: 20,
  ewmaLambda: 0.94,
});

// Méthode GARCH
const garch = DVOLCalculator.calculateDVOL(priceData, 'garch', {
  garchParams: {
    omega: 0.00001,
    alpha: 0.05,
    beta: 0.94,
  },
});

// Résultat:
// {
//   dvol: 42.15,               // DVOL en %
//   dvolIndex: 1.23,           // Index DVOL
//   method: 'ewma',            // Méthode utilisée
//   confidence: 0.95,          // Score de confiance
//   dataPoints: 30,            // Points utilisés
//   calculatedAt: Date          // Timestamp du calcul
// }
```

## 📈 Exemples

### Exemple complet: Comparaison Bitcoin vs Solana

```typescript
import { CoinGeckoProvider } from './src/providers/coingecko.js';
import { VolatilityCalculator } from './src/calculators/volatility.js';
import { DVOLCalculator } from './src/calculators/dvol.js';

const provider = new CoinGeckoProvider();

async function compareVolatility() {
  // Bitcoin
  const btcData = await provider.fetchPriceData('bitcoin', '30d');
  if (btcData.success && btcData.data) {
    const btcVol = VolatilityCalculator.calculateMetrics(btcData.data, '30d');
    const btcDvol = DVOLCalculator.calculateDVOL(btcData.data, 'ewma');
    
    console.log('Bitcoin:');
    console.log(`  Volatilité: ${btcVol.volatility.toFixed(2)}%`);
    console.log(`  DVOL: ${btcDvol.dvol.toFixed(2)}%`);
  }

  // Solana
  const solData = await provider.fetchPriceData('solana', '30d');
  if (solData.success && solData.data) {
    const solVol = VolatilityCalculator.calculateMetrics(solData.data, '30d');
    const solDvol = DVOLCalculator.calculateDVOL(solData.data, 'ewma');
    
    console.log('Solana:');
    console.log(`  Volatilité: ${solVol.volatility.toFixed(2)}%`);
    console.log(`  DVOL: ${solDvol.dvol.toFixed(2)}%`);
  }
}

compareVolatility();
```

## 🎯 Scripts npm

```bash
# Développement
npm run dev

# Builder le projet
npm run build

# Exécuter les exemples
npm run example              # Exemple complet
npm run example:jupiter      # Exemple Jupiter
npm run example:simple       # Exemple simple
npm run example:quickstart   # Démarrage rapide
npm run example:advanced     # Exemple avancé
npm run example:typescript   # Exemple TypeScript

# Nettoyer
npm run clean
```

## 🔧 Configuration TypeScript

Le projet est strictement typé avec `strict: true` en TypeScript.

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2024",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

## 📂 Structure du projet

```
src/
├── calculators/
│   ├── volatility.ts     # Calcul de volatilité
│   └── dvol.ts           # Calcul DVOL
├── providers/
│   ├── coingecko.ts      # Provider CoinGecko
│   ├── jupiter.ts        # Provider Jupiter
│   └── http-client.ts    # Client HTTP
├── lib/
│   └── index.ts          # Exports principaux
└── types.ts              # Définitions TypeScript

examples/
├── usage.ts              # Exemple complet
├── simple.ts             # Exemple simple
├── quickstart.ts         # Démarrage rapide
├── advanced.ts           # Exemple avancé
├── typescript.ts         # Exemple TypeScript
└── jupiter.ts            # Exemple Jupiter
```

## 🐛 Dépannage

### Erreur de rate limiting

Si vous recevez une erreur de rate limiting avec CoinGecko:
- CoinGecko: Attendez ~1.1 secondes entre les requêtes
- Jupiter: Attendez ~500ms entre les requêtes

### Erreur de données invalides

Vérifiez que:
- Les symboles sont valides (`bitcoin`, `solana`)
- Les périodes sont supportées (`1d`, `30d`, `365d`)
- Les données contiennent au moins 2 points

### Pas de prix actuel

Si le prix actuel n'est pas disponible:
- Vérifiez votre connexion internet
- Vérifiez que l'API n'est pas en maintenance
- Essayez avec un autre provider

## 📚 Documentation détaillée

- [Guide complet CoinGecko](./INTEGRATION.md)
- [Guide Jupiter Provider](./JUPITER_PROVIDER.md)
- [Résumé des exemples](./EXAMPLES_SUMMARY.md)
- [Feuille de triche](./CHEATSHEET.md)

## 🤝 Contribution

Les contributions sont bienvenues! Veuillez:

1. Fork le projet
2. Créer une branche pour votre feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence Apache 2.0. Voir [LICENSE](./LICENSE) pour plus de détails.

## 🙏 Remerciements

- CoinGecko pour l'API gratuite
- Jupiter pour l'agrégation de liquidité
- La communauté Solana et crypto

## 📞 Support

Pour toute question ou problème:
- Ouvrir une issue sur GitHub
- Consulter la documentation
- Vérifier les exemples

## 🔗 Liens utiles

- [CoinGecko API](https://www.coingecko.com/api/documentations/v3)
- [Jupiter API](https://www.jupiterapi.com/)
- [Solana Docs](https://docs.solana.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)