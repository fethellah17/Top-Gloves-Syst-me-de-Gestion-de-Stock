import { describe, it, expect } from "vitest";

describe("Occupancy Calculation", () => {
  type Mouvement = {
    id: number;
    date: string;
    article: string;
    ref: string;
    type: "Entrée" | "Sortie" | "Transfert";
    qte: number;
    emplacementSource?: string;
    emplacementDestination: string;
    operateur: string;
  };

  it("should calculate total occupancy for an emplacement based on movements", () => {
    const articles = [
      { id: 1, ref: "GN-M-001", nom: "Gants Nitrile M", categorie: "Gants Nitrile", stock: 2500, seuil: 500, unite: "paire", consommationParInventaire: -15, consommationJournaliere: 50 },
      { id: 2, ref: "GL-S-002", nom: "Gants Latex S", categorie: "Gants Latex", stock: 1800, seuil: 400, unite: "paire", consommationParInventaire: 12, consommationJournaliere: 35 },
      { id: 3, ref: "GV-L-003", nom: "Gants Vinyle L", categorie: "Gants Vinyle", stock: 1300, seuil: 600, unite: "paire", consommationParInventaire: 0, consommationJournaliere: 40 },
    ];

    const mouvements: Mouvement[] = [
      { id: 1, date: "2026-02-24 10:00", article: "Gants Nitrile M", ref: "GN-M-001", type: "Entrée", qte: 2500, emplacementDestination: "Zone A-12", operateur: "Op1" },
      { id: 2, date: "2026-02-24 11:00", article: "Gants Latex S", ref: "GL-S-002", type: "Entrée", qte: 1800, emplacementDestination: "Zone B-03", operateur: "Op2" },
      { id: 3, date: "2026-02-24 12:00", article: "Gants Vinyle L", ref: "GV-L-003", type: "Entrée", qte: 1300, emplacementDestination: "Zone A-12", operateur: "Op3" },
    ];

    const getArticleCurrentLocation = (articleRef: string): string | null => {
      const lastMovement = mouvements
        .filter(m => m.ref === articleRef)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (!lastMovement) return null;
      return lastMovement.emplacementDestination;
    };

    const calculateOccupancy = (emplacementName: string) => {
      return articles
        .filter(a => getArticleCurrentLocation(a.ref) === emplacementName)
        .reduce((sum, a) => sum + a.stock, 0);
    };

    // Test Zone A-12 should have 2500 + 1300 = 3800
    expect(calculateOccupancy("Zone A-12")).toBe(3800);

    // Test Zone B-03 should have 1800
    expect(calculateOccupancy("Zone B-03")).toBe(1800);

    // Test empty emplacement should return 0
    expect(calculateOccupancy("Zone C-01")).toBe(0);
  });

  it("should update occupancy when article is transferred", () => {
    const articles = [
      { id: 1, ref: "GN-M-001", nom: "Gants Nitrile M", categorie: "Gants Nitrile", stock: 2500, seuil: 500, unite: "paire", consommationParInventaire: -15, consommationJournaliere: 50 },
      { id: 2, ref: "GV-L-003", nom: "Gants Vinyle L", categorie: "Gants Vinyle", stock: 1300, seuil: 600, unite: "paire", consommationParInventaire: 0, consommationJournaliere: 40 },
    ];

    let mouvements: Mouvement[] = [
      { id: 1, date: "2026-02-24 10:00", article: "Gants Nitrile M", ref: "GN-M-001", type: "Entrée", qte: 2500, emplacementDestination: "Zone A-12", operateur: "Op1" },
      { id: 2, date: "2026-02-24 11:00", article: "Gants Vinyle L", ref: "GV-L-003", type: "Entrée", qte: 1300, emplacementDestination: "Zone A-12", operateur: "Op2" },
    ];

    const getArticleCurrentLocation = (articleRef: string): string | null => {
      const lastMovement = mouvements
        .filter(m => m.ref === articleRef)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (!lastMovement) return null;
      if (lastMovement.type === "Sortie" && lastMovement.emplacementSource) {
        return lastMovement.emplacementSource;
      }
      return lastMovement.emplacementDestination;
    };

    const calculateOccupancy = (emplacementName: string) => {
      return articles
        .filter(a => getArticleCurrentLocation(a.ref) === emplacementName)
        .reduce((sum, a) => sum + a.stock, 0);
    };

    // Initial occupancy
    expect(calculateOccupancy("Zone A-12")).toBe(3800);

    // Simulate transfer from Zone A-12 to Zone B-03
    mouvements = [...mouvements, {
      id: 3,
      date: "2026-02-24 12:00",
      article: "Gants Nitrile M",
      ref: "GN-M-001",
      type: "Transfert",
      qte: 2500,
      emplacementSource: "Zone A-12",
      emplacementDestination: "Zone B-03",
      operateur: "Op3"
    }];

    // Zone A-12 should now have only 1300 (Gants Vinyle L)
    expect(calculateOccupancy("Zone A-12")).toBe(1300);

    // Zone B-03 should now have 2500 (Gants Nitrile M)
    expect(calculateOccupancy("Zone B-03")).toBe(2500);
  });
});
