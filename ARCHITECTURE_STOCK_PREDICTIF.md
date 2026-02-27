# Architecture Technique - Système de Gestion du Stock Prédictif

## 📐 Vue d'ensemble de l'Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Pages (React Components)                  │
├─────────────────────────────────────────────────────────────┤
│  ArticlesPage.tsx  │  Dashboard.tsx  │  InventairePage.tsx  │
└──────────┬──────────────────────────┬──────────────────────┘
           │                          │
           ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Composants Réutilisables (Components)           │
├─────────────────────────────────────────────────────────────┤
│  StockDashboard  │  AutonomyBadge  │  StockStatusBadge     │
└──────────┬──────────────────────────┬──────────────────────┘
           │                          │
           └──────────────┬───────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Utilitaires (Lib/Utils)                         │
├─────────────────────────────────────────────────────────────┤
│  stock-utils.ts                                             │
│  - calculateAutonomy()                                      │
│  - getStockStatus()                                         │
└──────────┬──────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│              Contexte Global (Context)                       │
├─────────────────────────────────────────────────────────────┤
│  DataContext.tsx                                            │
│  - articles[]                                               │
│  - updateArticle()                                          │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Structure des Fichiers

```
src/
├── components/
│   ├── AutonomyBadge.tsx          # Badge d'autonomie avec couleurs
│   ├── StockStatusBadge.tsx       # Badge de statut avec tooltip
│   ├── StockDashboard.tsx         # Tableau de bord prédictif
│   ├── Modal.tsx                  # Composant modal existant
│   └── Toast.tsx                  # Composant toast existant
├── config/
│   └── stock-thresholds.ts        # Configuration des seuils
├── contexts/
│   └── DataContext.tsx            # Contexte global (modifié)
├── lib/
│   ├── stock-utils.ts            # Utilitaires de calcul
│   └── stock-utils.test.ts        # Tests unitaires
├── pages/
│   ├── ArticlesPage.tsx           # Page articles (modifiée)
│   ├── Dashboard.tsx              # Page tableau de bord (modifiée)
│   └── InventairePage.tsx         # Page inventaire
└── ...
```

## 🔧 Composants Clés

### 1. `stock-utils.ts`

**Responsabilités** :
- Calcul de l'autonomie en jours/heures
- Détermination du statut dynamique
- Gestion des seuils critiques

**Fonctions Principales** :

```typescript
calculateAutonomy(stock: number, dailyConsumption: number): AutonomyInfo
// Retourne : { days, hours, label, isLow }

getStockStatus(stock: number, seuil: number, dailyConsumption: number): StockStatus
// Retourne : { level, label, color, bgColor, icon }
```

### 2. `AutonomyBadge.tsx`

**Responsabilités** :
- Affichage de l'autonomie
- Gestion des couleurs selon l'autonomie
- Affichage des icônes emoji

**Props** :
```typescript
interface AutonomyBadgeProps {
  autonomy: AutonomyInfo;
}
```

### 3. `StockStatusBadge.tsx`

**Responsabilités** :
- Affichage du statut
- Gestion de la tooltip
- Affichage de l'icône d'alerte

**Props** :
```typescript
interface StockStatusBadgeProps {
  status: StockStatus;
  autonomyLabel: string;
  dailyConsumption: number;
}
```

### 4. `StockDashboard.tsx`

**Responsabilités** :
- Affichage du tableau de bord prédictif
- Filtrage des articles par statut
- Affichage des résumés et tableaux détaillés

**Fonctionnalités** :
- Compteurs par statut
- Tableaux détaillés pour chaque catégorie
- Intégration des composants AutonomyBadge et StockStatusBadge

## 🔄 Flux de Données

### Ajout/Modification d'Article

```
Utilisateur remplit le formulaire
        ↓
handleSubmit() valide les données
        ↓
addArticle() / updateArticle() dans DataContext
        ↓
État React mis à jour
        ↓
Composants re-rendus avec nouvelles données
        ↓
calculateAutonomy() et getStockStatus() recalculés
        ↓
UI mise à jour avec nouveaux statuts et autonomies
```

### Affichage du Tableau de Bord

```
Utilisateur accède au Dashboard
        ↓
StockDashboard récupère articles du contexte
        ↓
Filtre les articles par statut
        ↓
Pour chaque article :
  - calculateAutonomy()
  - getStockStatus()
        ↓
Affiche les résumés et tableaux
```

## 🎨 Système de Couleurs

### Conformité à la Charte Top Gloves

```typescript
CRITICAL: {
  bg: "bg-red-50",
  border: "border-red-200",
  text: "text-red-600",
  icon: "🔴"
}

WARNING: {
  bg: "bg-orange-50",
  border: "border-orange-200",
  text: "text-orange-600",
  icon: "🟠"
}

SECURE: {
  bg: "bg-green-50",
  border: "border-green-200",
  text: "text-green-600",
  icon: "🟢"
}
```

## 📊 Logique de Calcul

### Autonomie

```typescript
const totalHours = (stock / dailyConsumption) * 24;
const days = Math.floor(totalHours / 24);
const hours = Math.floor(totalHours % 24);
```

### Statut

```typescript
if (stock <= seuil || totalHours <= 72) {
  return CRITICAL;
} else if (totalHours > 72 && totalHours <= 168) {
  return WARNING;
} else {
  return SECURE;
}
```

## 🧪 Tests

### Fichier de Test

`src/lib/stock-utils.test.ts`

**Cas de Test Couverts** :
- Calcul d'autonomie en jours
- Calcul d'autonomie en heures
- Autonomie < 1 jour
- Détection des articles critiques
- Détection des articles en attention
- Détection des articles sécurisés
- Gestion des cas limites (consommation 0, etc.)

**Exécution** :
```bash
npm run test
# ou
vitest
```

## 🔐 Sécurité et Validation

### Validation des Données

- **CJE** : Doit être un nombre positif
- **Stock** : Doit être un nombre ≥ 0
- **Seuil** : Doit être un nombre ≥ 0
- **Consommation** : Doit être un nombre ≥ 0

### Gestion des Erreurs

- Division par zéro : Retourne "N/A"
- Données invalides : Affiche un message d'erreur
- Contexte manquant : Lève une erreur explicite

## 📈 Performance

### Optimisations

- **Calculs en Frontend** : Pas d'appel API pour les calculs
- **Réactivité** : Mise à jour instantanée sans latence
- **Memoization** : Utilisation de React.memo pour les composants
- **Lazy Loading** : Chargement des données à la demande

### Complexité

- **Calcul d'autonomie** : O(1)
- **Détermination du statut** : O(1)
- **Filtrage des articles** : O(n)
- **Rendu du tableau de bord** : O(n)

## 🔄 Intégration avec le Contexte Global

### Modifications du DataContext

```typescript
interface Article {
  // ... champs existants
  consommationJournaliere: number;  // ← Nouveau champ
}
```

### Initialisation des Données

```typescript
const initialArticles: Article[] = [
  {
    // ... données existantes
    consommationJournaliere: 50,  // ← Valeur par défaut
  },
  // ...
];
```

## 🚀 Déploiement

### Dépendances

- React 18+
- TypeScript 5+
- Tailwind CSS 3+
- Lucide React (pour les icônes)

### Compatibilité Navigateurs

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 Documentation

### Fichiers de Documentation

1. **PREDICTIVE_STOCK_SYSTEM.md** : Vue d'ensemble du système
2. **GUIDE_UTILISATION_STOCK_PREDICTIF.md** : Guide utilisateur
3. **ARCHITECTURE_STOCK_PREDICTIF.md** : Documentation technique (ce fichier)

## 🔮 Évolutions Futures

### Court Terme

- [ ] Historique des consommations
- [ ] Graphiques de tendances
- [ ] Export des données en CSV/PDF

### Moyen Terme

- [ ] Prévisions basées sur ML
- [ ] Alertes par email/SMS
- [ ] Intégration avec les fournisseurs

### Long Terme

- [ ] Commandes automatiques
- [ ] Optimisation des stocks
- [ ] Analyse prédictive avancée

---

**Dernière mise à jour** : Février 2026
**Version** : 1.0
