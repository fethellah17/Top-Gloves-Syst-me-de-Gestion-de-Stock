/**
 * Configuration des seuils pour le système de gestion du stock prédictif
 */

export const STOCK_THRESHOLDS = {
  // Seuils d'autonomie (en heures)
  CRITICAL_AUTONOMY_HOURS: 72, // 3 jours
  WARNING_AUTONOMY_HOURS: 168, // 7 jours

  // Couleurs conformes à la charte Top Gloves
  COLORS: {
    CRITICAL: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-600",
      icon: "🔴",
    },
    WARNING: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-600",
      icon: "🟠",
    },
    SECURE: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-600",
      icon: "🟢",
    },
  },

  // Messages d'alerte
  MESSAGES: {
    CRITICAL: "Action urgente requise - Commande immédiate",
    WARNING: "Prévoir une commande dans les prochains jours",
    SECURE: "Stock sécurisé - Aucune action requise",
  },
} as const;

/**
 * Calcule le nombre de jours à partir d'heures
 */
export const hoursToReadableFormat = (hours: number): string => {
  if (hours === 0) return "N/A";
  
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);

  if (days > 0) {
    return remainingHours > 0 ? `${days}j ${remainingHours}h` : `${days}j`;
  }
  return `${remainingHours}h`;
};
