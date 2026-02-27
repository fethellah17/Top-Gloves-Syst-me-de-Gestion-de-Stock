# 🔍 Tableau des Mouvements - Outil d'Audit Optimisé

## Vue d'ensemble

Le tableau des Mouvements a été transformé en un véritable outil d'audit avec une séparation claire entre Source et Destination. L'affichage est optimisé pour une lecture instantanée : **[Source] → [Destination]**.

## ✨ Colonnes d'Audit

### 1. Colonne "Source" 📤

Affiche **uniquement** l'emplacement d'origine de l'article.

#### Comportement par Type de Mouvement

| Type de Mouvement | Affichage | Exemple |
|-------------------|-----------|---------|
| **Sortie** | Emplacement source | `Zone D - Rack 05` |
| **Entrée** | — (pas de source interne) | `—` |
| **Transfert** | Emplacement source | `Zone E - Quarantaine` |
| **Ajustement** | Emplacement concerné | `Zone D - Rack 05` |

**Responsive** : Visible uniquement sur écrans XL+ (hidden xl:table-cell)

### 2. Colonne "Destination" 📥

Affiche **uniquement** l'emplacement d'arrivée ou le département d'utilisation.

#### Comportement par Type de Mouvement

| Type de Mouvement | Affichage | Exemple |
|-------------------|-----------|---------|
| **Sortie** | Département d'utilisation | `Département Production` |
| **Entrée** | Emplacement de destination | `Zone A - Rack 12` |
| **Transfert** | Emplacement de destination | `Zone D - Rack 05` |
| **Ajustement** | — (modification sur place) | `—` |

**Responsive** : Visible uniquement sur écrans MD+ (hidden md:table-cell)

### 3. Colonne "Approuvé par" ✅

Affiche le nom de l'opérateur qui a validé le mouvement via le contrôle qualité.

#### Comportement par Type et Statut

| Type/Statut | Affichage | Couleur | Signification |
|-------------|-----------|---------|---------------|
| **Sortie validée** | Nom du contrôleur | Noir (foreground) | Ex: "Marie L." |
| **Sortie en attente** | "En attente" | Orange | Pas encore validé |
| **Sortie rejetée** | Nom du contrôleur | Noir | Qui a rejeté |
| **Entrée directe** | "Système" | Bleu | Bypass automatique |
| **Ajustement** | "Système" | Bleu | Bypass automatique |
| **Transfert** | "N/A" | Gris clair | Non applicable |

**Responsive** : Visible uniquement sur écrans LG+ (hidden lg:table-cell)

## 📊 Ordre des Colonnes du Tableau

1. **Date** - Horodatage du mouvement
2. **Article** - Nom et référence
3. **Type** - Badge coloré (Entrée/Sortie/Transfert/Ajustement)
4. **Quantité** - Nombre d'unités
5. **Source** 📤 - Emplacement d'origine (propre et concis)
6. **Destination** 📥 - Emplacement d'arrivée ou département (propre et concis)
7. **Statut** - Badge de validation
8. **Opérateur** - Qui a créé le mouvement
9. **Approuvé par** ✅ - Qui a validé le mouvement
10. **Actions** - Boutons d'action

## 🎯 Exemples de Lecture Instantanée

### Transfert
- **Source** : `Zone E - Quarantaine`
- **Destination** : `Zone D - Rack 05`
- **Lecture** : Article transféré de Quarantaine vers Rack 05

### Sortie
- **Source** : `Zone D - Rack 05`
- **Destination** : `Département Production`
- **Lecture** : Article sorti du Rack 05 vers Production

### Entrée
- **Source** : `—`
- **Destination** : `Zone A - Rack 12`
- **Lecture** : Article entré (provenance externe) dans Rack 12

### Ajustement
- **Source** : `Zone D - Rack 05`
- **Destination** : `—`
- **Lecture** : Ajustement d'inventaire sur place dans Rack 05

## 🔧 Implémentation Technique

### Fonctions Helper Optimisées

```typescript
// Colonne SOURCE : Affiche uniquement l'emplacement d'origine
const getSourceLabel = (mouvement: Mouvement) => {
  if (mouvement.type === "Sortie" || mouvement.type === "Transfert" || mouvement.type === "Ajustement") {
    return mouvement.emplacementSource || "N/A";
  }
  // Pour les Entrées, il n'y a pas de source (provenance externe)
  return "—";
};

// Colonne DESTINATION : Affiche uniquement l'emplacement d'arrivée ou le département
const getDestinationLabel = (mouvement: Mouvement) => {
  if (mouvement.type === "Entrée" || mouvement.type === "Transfert") {
    return mouvement.emplacementDestination;
  }
  if (mouvement.type === "Sortie") {
    // Pour les sorties, afficher le département/utilisation
    return mouvement.emplacementDestination;
  }
  if (mouvement.type === "Ajustement") {
    // Pour les ajustements, pas de destination (modification sur place)
    return "—";
  }
  return "N/A";
};
```

### Principes de Nettoyage

✅ **Fait** :
- Suppression de toute répétition textuelle (plus de "De... vers...")
- Données propres et concises (juste le nom de la zone/rack ou département)
- Séparation nette entre Source et Destination

❌ **Évité** :
- Phrases complètes dans les cellules
- Répétition d'informations entre colonnes
- Texte verbeux ou redondant

## 🎨 Design et UX

### Codes Couleur pour "Approuvé par"

- **Nom du contrôleur** : Texte noir, police medium → Validation confirmée
- **"En attente"** : Orange, police medium → Nécessite une action
- **"Système"** : Bleu, police medium → Bypass automatique
- **"N/A"** : Gris clair → Non applicable

### Symboles Utilisés

- **—** : Tiret cadratin pour indiquer "non applicable" ou "pas de valeur"
- **N/A** : Pour les cas d'erreur ou données manquantes

### Responsive Design

Les colonnes sont masquées sur petits écrans pour préserver la lisibilité :

- **Source** : Visible uniquement sur XL+ (≥1280px)
- **Destination** : Visible uniquement sur MD+ (≥768px)
- **Approuvé par** : Visible uniquement sur LG+ (≥1024px)

## 🎯 Cas d'Usage

### Audit d'une Sortie

**Question** : "Quel rack a été vidé et où est allée la marchandise ?"

**Réponse en un coup d'œil** :
- Colonne **Source** : `Zone D - Rack 05`
- Colonne **Destination** : `Département Production`
- Colonne **Approuvé par** : `Marie L.`

### Traçabilité d'un Transfert

**Question** : "D'où vient cet article et où est-il maintenant ?"

**Réponse** :
- Colonne **Source** : `Zone E - Quarantaine`
- Colonne **Destination** : `Zone D - Rack 05`
- **Lecture instantanée** : Quarantaine → Rack 05

### Identification des Entrées

**Question** : "Où a été stocké cet article entrant ?"

**Réponse** :
- Colonne **Source** : `—` (provenance externe)
- Colonne **Destination** : `Zone A - Rack 12`

### Vérification des Ajustements

**Question** : "Où a eu lieu cet ajustement d'inventaire ?"

**Réponse** :
- Colonne **Source** : `Zone D - Rack 05`
- Colonne **Destination** : `—` (modification sur place)
- Colonne **Approuvé par** : `Système` (bypass du contrôle qualité)

## ✅ Avantages de l'Optimisation

1. **Clarté maximale** : Séparation nette Source/Destination
2. **Lecture instantanée** : Format [Source] → [Destination]
3. **Pas de répétition** : Chaque information apparaît une seule fois
4. **Données concises** : Juste le nom de la zone ou du département
5. **Traçabilité complète** : Chaque mouvement est traçable de sa source à sa validation
6. **Audit facilité** : Identification rapide des flux de stock

## 🔄 Flux de Validation

### Sortie Standard
1. Opérateur crée une sortie → `emplacementSource` enregistré
2. Statut : "En attente de validation Qualité"
3. Contrôleur valide → `controleur` enregistré
4. Statut : "Terminé"
5. **Tableau affiche** : Source = Rack source, Destination = Département, Approuvé par = Nom du contrôleur

### Entrée Directe
1. Opérateur crée une entrée → `emplacementDestination` enregistré
2. Statut : "Terminé" (immédiat)
3. **Tableau affiche** : Source = —, Destination = Rack destination, Approuvé par = "Système"

### Transfert
1. Opérateur crée un transfert → `emplacementSource` et `emplacementDestination` enregistrés
2. Statut : "Terminé" (immédiat)
3. **Tableau affiche** : Source = Rack source, Destination = Rack destination, Approuvé par = "N/A"

### Ajustement (Bypass)
1. Opérateur crée un ajustement → `emplacementSource` enregistré
2. Statut : "Terminé" (immédiat, bypass du contrôle qualité)
3. **Tableau affiche** : Source = Rack concerné, Destination = —, Approuvé par = "Système"

## 📝 Notes Techniques

- Les données d'emplacement sont déjà présentes dans les objets `Mouvement`
- Le champ `controleur` est rempli automatiquement lors de l'approbation
- Aucune migration de données nécessaire
- Compatible avec tous les mouvements existants
- Performance optimale (pas de requêtes supplémentaires)
- Affichage propre sans concaténation de texte

## 🚀 Prochaines Étapes Possibles

1. **Export CSV** : Inclure les colonnes Source/Destination dans les exports
2. **Filtres avancés** : Filtrer par emplacement source ou destination
3. **Statistiques** : Analyse des flux entre emplacements
4. **Alertes** : Notifications pour les mouvements en attente
5. **Historique** : Voir l'historique complet d'un emplacement
6. **Graphiques** : Visualisation des flux Source → Destination

---

**Date de mise à jour** : 27 février 2026
**Version** : 2.0 - Optimisation Source/Destination
**Statut** : ✅ Implémenté et testé
