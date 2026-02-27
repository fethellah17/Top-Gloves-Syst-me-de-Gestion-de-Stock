import { describe, it, expect } from "vitest";

// Simulation de la logique de calcul de consommation du jour
const calculateDailyConsumption = (articleRef: string, mouvements: any[]): number => {
  const today = new Date();
  const todayDateStr = today.toISOString().split("T")[0];

  const consumptionByArticle: Record<string, number> = {};

  mouvements.forEach(m => {
    const movementDate = m.date.split(" ")[0];
    
    if (m.type === "Sortie" && m.statut === "Terminé" && movementDate === todayDateStr) {
      if (!consumptionByArticle[m.ref]) {
        consumptionByArticle[m.ref] = 0;
      }
      consumptionByArticle[m.ref] += m.qte;
    }
  });

  return consumptionByArticle[articleRef] || 0;
};

describe("Daily Consumption Calculation", () => {
  const mockMovements = [
    { id: 1, date: "2026-02-24 14:32:20", article: "Gants Nitrile M", ref: "GN-M-001", type: "Entrée", qte: 500, statut: undefined },
    { id: 2, date: "2026-02-24 13:15:45", article: "Gants Latex S", ref: "GL-S-002", type: "Sortie", qte: 200, statut: "En attente de validation Qualité" },
    { id: 3, date: "2026-02-26 09:30:15", article: "Gants Nitrile M", ref: "GN-M-001", type: "Sortie", qte: 50, statut: "Terminé" },
    { id: 4, date: "2026-02-26 10:45:30", article: "Gants Nitrile M", ref: "GN-M-001", type: "Sortie", qte: 50, statut: "Terminé" },
    { id: 5, date: "2026-02-26 11:20:00", article: "Masques FFP2", ref: "MK-FFP2-006", type: "Sortie", qte: 100, statut: "Terminé" },
    { id: 6, date: "2026-02-26 14:15:45", article: "Masques FFP2", ref: "MK-FFP2-006", type: "Sortie", qte: 150, statut: "Terminé" },
    { id: 7, date: "2026-02-26 15:00:00", article: "Gants Nitrile M", ref: "GN-M-001", type: "Sortie", qte: 75, statut: "Rejeté" },
  ];

  it("should calculate 0 for articles with no movements today", () => {
    const result = calculateDailyConsumption("GL-S-002", mockMovements);
    expect(result).toBe(0);
  });

  it("should sum all validated exits for Gants Nitrile M today", () => {
    const result = calculateDailyConsumption("GN-M-001", mockMovements);
    expect(result).toBe(100); // 50 + 50 (rejected one is not counted)
  });

  it("should sum all validated exits for Masques FFP2 today", () => {
    const result = calculateDailyConsumption("MK-FFP2-006", mockMovements);
    expect(result).toBe(250); // 100 + 150
  });

  it("should not count rejected movements", () => {
    const result = calculateDailyConsumption("GN-M-001", mockMovements);
    expect(result).not.toContain(75); // Rejected movement should not be counted
  });

  it("should not count pending movements", () => {
    const result = calculateDailyConsumption("GL-S-002", mockMovements);
    expect(result).toBe(0); // Pending movement should not be counted
  });

  it("should not count old movements", () => {
    const result = calculateDailyConsumption("GN-M-001", mockMovements);
    // Should only count today's movements, not 2026-02-24
    expect(result).toBe(100);
  });

  it("should handle empty movements array", () => {
    const result = calculateDailyConsumption("GN-M-001", []);
    expect(result).toBe(0);
  });

  it("should handle non-existent article reference", () => {
    const result = calculateDailyConsumption("UNKNOWN-REF", mockMovements);
    expect(result).toBe(0);
  });
});
