import { useState } from "react";
import { ClipboardCheck, Check, AlertTriangle, Save, CheckCircle2 } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Toast } from "@/components/Toast";

interface InventoryItem {
  id: number;
  ref: string;
  nom: string;
  emplacement: string;
  stockTheorique: number;
  stockPhysique: number | null;
  isVerified: boolean;
}

const InventairePage = () => {
  const { articles, inventoryHistory, addInventoryRecord, getArticleCurrentLocation } = useData();
  const [items, setItems] = useState<InventoryItem[]>(articles.map(a => ({
    id: a.id,
    ref: a.ref,
    nom: a.nom,
    emplacement: getArticleCurrentLocation(a.ref) || "Non localisé",
    stockTheorique: a.stock,
    stockPhysique: null,
    isVerified: false,
  })));
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const today = new Date().toLocaleDateString("fr-FR");

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updatePhysique = (id: number, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stockPhysique: value === "" ? null : Number(value) } : item))
    );
  };

  const getEcart = (theorique: number, physique: number | null) => {
    if (physique === null) return null;
    return physique - theorique;
  };

  const handleSaveLineItem = (id: number) => {
    const item = items.find(i => i.id === id);
    if (!item || item.stockPhysique === null) {
      showToast("Veuillez saisir un stock physique pour cet article", "error");
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+)/, "$3-$2-$1 $4:$5");

    const ecart = getEcart(item.stockTheorique, item.stockPhysique);
    if (ecart !== null) {
      addInventoryRecord({
        dateHeure: dateStr,
        article: item.nom,
        stockTheorique: item.stockTheorique,
        stockPhysique: item.stockPhysique,
        ecart: ecart,
      });
    }

    // Marquer l'article comme vérifié
    setItems(prev => prev.map(i => i.id === id ? { ...i, isVerified: true } : i));
    showToast(`${item.nom} enregistré avec succès`, "success");
  };

  const completed = items.filter((i) => i.isVerified).length;

  const handleResetInventory = () => {
    // Réinitialiser le tableau de saisie pour une nouvelle session
    setItems(prev => prev.map(item => ({
      ...item,
      stockPhysique: null,
      isVerified: false,
    })));
    showToast("Tableau réinitialisé pour une nouvelle session d'inventaire", "success");
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Inventaire Quotidien</h2>
          <p className="text-sm text-muted-foreground">Date: {today}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono">
            {completed}/{items.length} articles vérifiés
          </span>
          {completed === items.length && (
            <button
              onClick={handleResetInventory}
              className="h-9 px-4 rounded-md text-sm font-medium flex items-center gap-2 bg-info text-info-foreground hover:opacity-90 transition-all"
            >
              <Check className="w-4 h-4" />
              Nouvelle Session
            </button>
          )}
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Article</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Emplacement</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Théorique</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Physique</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Écart</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const ecart = getEcart(item.stockTheorique, item.stockPhysique);
                return (
                  <tr key={item.id} className={`border-b border-border/50 ${item.isVerified ? "bg-success/5" : ""}`}>
                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground">{item.nom}</span>
                      <span className="block text-[10px] text-muted-foreground font-mono">{item.ref}</span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs hidden sm:table-cell">{item.emplacement}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">{item.stockTheorique.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={item.stockPhysique ?? ""}
                        onChange={(e) => updatePhysique(item.id, e.target.value)}
                        placeholder="—"
                        disabled={item.isVerified}
                        className={`w-24 h-8 mx-auto block text-center rounded-md border bg-background text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                          item.isVerified ? "bg-success/10 border-success/50 cursor-not-allowed" : ""
                        }`}
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {ecart !== null ? (
                        <span className={`font-mono font-semibold ${ecart === 0 ? "text-success" : ecart > 0 ? "text-info" : "text-danger"}`}>
                          {ecart > 0 ? "+" : ""}{ecart}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.isVerified ? (
                        <div className="flex items-center justify-center gap-1">
                          <Check className="w-4 h-4 text-success" />
                          <span className="text-xs text-success font-medium">Vérifié</span>
                        </div>
                      ) : item.stockPhysique === null ? (
                        <span className="text-muted-foreground text-xs">En attente</span>
                      ) : ecart === 0 ? (
                        <Check className="w-4 h-4 text-success mx-auto" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-warning mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.isVerified ? (
                        <CheckCircle2 className="w-5 h-5 text-success mx-auto" />
                      ) : (
                        <button
                          onClick={() => handleSaveLineItem(item.id)}
                          disabled={item.stockPhysique === null}
                          className={`h-8 px-3 rounded-md text-xs font-medium flex items-center gap-1 mx-auto transition-all ${
                            item.stockPhysique === null
                              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                              : "bg-info text-info-foreground hover:opacity-90"
                          }`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Valider</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historique des Inventaires Passés */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="border-b bg-muted/50 p-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Historique des Inventaires Passés ({inventoryHistory.length} entrées)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date et Heure</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Article</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stock Théorique</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stock Physique</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Écart</th>
              </tr>
            </thead>
            <tbody>
              {inventoryHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-muted-foreground text-sm">
                    Aucun inventaire enregistré pour le moment
                  </td>
                </tr>
              ) : (
                [...inventoryHistory].reverse().map((record) => (
                  <tr key={record.id} className="border-b border-border/50">
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{record.dateHeure}</td>
                    <td className="py-3 px-4 text-foreground">{record.article}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">{record.stockTheorique.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">{record.stockPhysique.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-mono font-semibold ${record.ecart === 0 ? "text-success" : record.ecart > 0 ? "text-info" : "text-danger"}`}>
                        {record.ecart > 0 ? "+" : ""}{record.ecart}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default InventairePage;
