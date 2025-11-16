# Exemples d'utilisation - crypto-volatility

Cette dossier contient des exemples d'utilisation complets de la librairie `crypto-volatility`.

## 📋 Contenu

### 1. **simple.ts** - Exemple basique
L'utilisation la plus simple et directe de la librairie.

**Cas d'usage:**
- Calcul rapide de la volatilité
- Calcul du DVOL avec une seule méthode
- Affichage simple des résultats

**Exécution:**
```bash
npm run example
# ou
yarn example
```

**Code:**
```typescript
import { CoinGeckoProvider } from '../src/providers/coingecko.js';
import { VolatilityCalculator } from '../src/calculators/volatility.js';
import { DVOLCalculator } from '../src/calculators/dvol.js';

// 1. Récupérer les données
const provider = new CoinGeckoProvider();
const response = await provider.fetchPriceData('bitcoin', '30d');

// 2. Calculer la volatilité
const volatility = VolatilityCalculator.calculateMetrics(response.data, '30d');

// 3. Calculer le DVOL
const dvol = DVOLCalculator.calculateDVOL(response.data, 'ewma');

// 4. Afficher les résultats
console.log(`Volatilité: ${volatility.volatility.toFixed(2)}%`);
console.log(`DVOL: ${dvol.dvol.toFixed(2)}%`);
```

---

### 2. **usage.ts** - Exemple complet
Un exemple complet montrant toutes les capacités de la librairie.

**Cas d'usage:**
- Récupération et validation des données
- Calcul de volatilité standard
- Comparaison de trois méthodes DVOL (Simple, EWMA, GARCH)
- Diagnostics statistiques
- Comparaison Bitcoin vs Solana

**Exécution:**
```bash
tsx examples/usage.ts
```

**Sections principales:**
1. **Récupération des données** - Fetch depuis CoinGecko avec gestion des erreurs
2. **Statistiques des prix** - Min, max, moyenne, plage
3. **Volatilité standard** - Calcul basique
4. **Comparaison DVOL** - Trois méthodes différentes
5. **Diagnostics** - Autocorrélation, hétéroscédasticité, asymétrie, aplatissement
6. **Comparaison multi-crypto** - Bitcoin vs Solana

**Output exemple:**
```
============================================================
CRYPTO VOLATILITY - EXEMPLE D'UTILISATION
============================================================

Configuration:
  • Crypto: BITCOIN
  • Période: 30d
  • Méthodes DVOL: simple, ewma, garch

============================================================
RÉCUPÉRATION DES DONNÉES DE PRIX
============================================================

✓ 30 points de données récupérés

→ Statistiques des Prix
────────────────────────────────────
  Prix minimum: $42,105.23
  Prix maximum: $44,567.89
  Prix moyen: $43,287.45
  Plage: $2,462.66 (5.84%)

============================================================
CALCUL DE LA VOLATILITÉ
============================================================

→ Résultats de Volatilité
────────────────────────────────────
  Volatilité: 2.14%
  Variance: 45.78
  Volatilité Annualisée: 37.21%

============================================================
CALCUL DU DVOL (Realized Volatility)
============================================================

→ Résultats DVOL par Méthode

  SIMPLE:
    DVOL: 2.10%
    Index DVOL: 45.3
    Confiance: 87.5%
    Points de données: 30
    Calculé à: 14/11/2025 15:30:45

  EWMA:
    DVOL: 2.15%
    Index DVOL: 46.2
    Confiance: 91.2%
    Points de données: 30
    Calculé à: 14/11/2025 15:30:46

  GARCH:
    DVOL: 2.18%
    Index DVOL: 46.8
    Confiance: 88.7%
    Points de données: 30
    Calculé à: 14/11/2025 15:30:47
```

---

### 3. **advanced.ts** - Exemples avancés
Une classe `CryptoVolatilityAnalyzer` pour des analyses avancées.

**Cas d'usage:**
- Comparaison de volatilité entre plusieurs cryptos
- Comparaison de différentes méthodes DVOL
- Détection d'anomalies
- Analyse statistique avancée

**Exécution:**
```bash
tsx examples/advanced.ts
```

**Principales méthodes:**

#### `analyzeMultipleCryptos(cryptos, period, dvolMethod)`
Analyse la volatilité pour plusieurs cryptos.

```typescript
const analyzer = new CryptoVolatilityAnalyzer();
const results = await analyzer.analyzeMultipleCryptos(
  ['bitcoin', 'solana'],
  '30d',
  'ewma'
);
```

**Output:**
```
📊 ANALYSE DE VOLATILITÉ MULTI-CRYPTO
==================================================
Période: 30d | Méthode DVOL: EWMA
==================================================

✓ BITCOIN
  Volatilité: 2.14%
  DVOL: 2.15%
  Index: 46.2/100

✓ SOLANA
  Volatilité: 3.45%
  DVOL: 3.52%
  Index: 58.1/100

==================================================
📈 CLASSEMENT PAR VOLATILITÉ
==================================================
1. SOLANA     - DVOL: 3.52% | Index: 58.1/100
2. BITCOIN    - DVOL: 2.15% | Index: 46.2/100

--------------------------------------------------
Moyenne DVOL: 2.84%
Range DVOL: 2.15% - 3.52%
Écart: 1.37%
```

#### `compareDVOLMethods(crypto, period)`
Compare les trois méthodes DVOL.

```typescript
await analyzer.compareDVOLMethods('bitcoin', '30d');
```

#### `detectVolatilityAnomalies(crypto, period)`
Détecte les mouvements anormaux.

```typescript
await analyzer.detectVolatilityAnomalies('bitcoin', '30d');
```

**Output:**
```
🔍 DÉTECTION D'ANOMALIES DE VOLATILITÉ
==================================================
Crypto: BITCOIN | Période: 30d
==================================================

Seuil de détection: 2 écarts-types
Nombre d'anomalies détectées: 3/30

Top 5 anomalies:
  1. Z-score: 2.45 | Return: 3.42% | Date: 12/11/2025
  2. Z-score: 2.23 | Return: -2.89% | Date: 10/11/2025
  3. Z-score: 2.12 | Return: 2.15% | Date: 08/11/2025

--------------------------------------------------
📊 DIAGNOSTICS
Asymétrie (Skewness): 0.3421
Aplatissement (Kurtosis): 3.5678
⚠  Attention: Kurtosis élevé = queue grasse (mouvements extrêmes fréquents)
```

---

## 🚀 Installation et exécution

### Installation des dépendances
```bash
npm install
# ou
yarn install
```

### Build TypeScript
```bash
npm run build
```

### Exécuter les exemples

**Exemple simple (recommandé pour commencer):**
```bash
npm run example
```

**Exemple complet:**
```bash
tsx examples/usage.ts
```

**Exemple avancé:**
```bash
tsx examples/advanced.ts
```

---

## 📊 Concepts clés

### Volatilité
La volatilité mesure l'écart-type des rendements logarithmiques sur une période donnée.

```typescript
const volatility = VolatilityCalculator.calculateMetrics(priceData, '30d');
// volatility.volatility       : en %
// volatility.annualizedVolatility : volatilité annualisée en %
```

### DVOL (Realized Volatility)
Trois méthodes différentes pour calculer le DVOL:

1. **Simple**: Moyenne mobile de la volatilité sur une fenêtre glissante
   - Rapide et facile à interpréter
   - Idéal pour un suivi en temps réel

2. **EWMA** (Exponentially Weighted Moving Average): Pondération des données récentes
   - Donne plus de poids aux données récentes
   - Réagit plus vite aux changements

3. **GARCH** (Generalized Autoregressive Conditional Heteroskedasticity): Modèle statistique avancé
   - Plus sophistiqué et précis
   - Tient compte de la volatilité conditionnelle

### Index DVOL
Normalisé sur une échelle 0-100:
- **0-25**: Très faible volatilité
- **25-50**: Faible volatilité
- **50-75**: Volatilité modérée
- **75-100**: Haute volatilité

### Confiance
Score de qualité de la prédiction DVOL:
- **90-100%**: Haute confiance
- **70-90%**: Confiance modérée
- **<70%**: Faible confiance

---

## 🔧 Configuration avancée

### Options DVOL
```typescript
const options = {
  windowSize: 20,              // Taille de la fenêtre (Simple)
  ewmaLambda: 0.94,            // Paramètre EWMA (0-1)
  garchParams: {
    omega: 0.000001,
    alpha: 0.1,
    beta: 0.85
  },
  annualizationFactor: 365     // Pour annualisation
};

const dvol = DVOLCalculator.calculateDVOL(priceData, 'ewma', options);
```

### Diagnostics
```typescript
const diagnostics = DVOLCalculator.calculateDiagnostics(priceData, 'ewma');
// autocorrelation    : relation avec les valeurs passées
// heteroskedasticity : volatilité changeante
// skewness           : asymétrie de la distribution
// kurtosis           : présence de queues grasses
```

---

## 💡 Cas d'usage réels

### 1. Surveillance de risque
```typescript
const analyzer = new CryptoVolatilityAnalyzer();
const results = await analyzer.analyzeMultipleCryptos(['bitcoin', 'solana'], '30d');
// Alerter si DVOL > seuil critique
```

### 2. Optimisation de portefeuille
```typescript
// Comparer la volatilité pour l'allocation d'actifs
await analyzer.analyzeMultipleCryptos(['bitcoin', 'solana', 'ethereum'], '365d');
```

### 3. Détection d'anomalies de marché
```typescript
// Identifier les jours avec mouvements anormaux
await analyzer.detectVolatilityAnomalies('bitcoin', '30d');
```

### 4. Backtesting de stratégies
```typescript
// Évaluer comment la stratégie se comporte à différents niveaux de volatilité
const lowVolPeriod = await provider.fetchPriceData('bitcoin', '1d');
const lowVolMetrics = VolatilityCalculator.calculateMetrics(lowVolPeriod.data, '1d');
```

---

## ⚠️ Notes importantes

1. **Taux de limite CoinGecko**: La librairie respecte un délai de 1.1s entre les requêtes
2. **Données minimales**: Besoin d'au moins 2 points pour la volatilité, 10 pour GARCH
3. **Qualité des données**: Les prix négatifs ou zéro sont rejetés
4. **Annualisation**: Ajustée automatiquement selon la période

---

## 📚 Ressources additionnelles

- [Documentation CoinGecko API](https://www.coingecko.com/en/api/documentation)
- [Volatility Trading](https://en.wikipedia.org/wiki/Volatility_(finance))
- [GARCH Models](https://en.wikipedia.org/wiki/Autoregressive_conditional_heteroskedasticity)
- [Realized Volatility](https://en.wikipedia.org/wiki/Realized_volatility)

---

## 🤝 Contribution

Pour contribuer des exemples supplémentaires, veuillez:
1. Créer un fichier dans `examples/`
2. Suivre la convention de nommage: `{description}.ts`
3. Inclure des commentaires et du formatage
4. Documenter dans ce fichier README.md
