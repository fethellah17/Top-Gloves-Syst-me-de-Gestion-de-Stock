import { useState, useMemo } from "react";
import { Package, Plus, Search, Edit, Trash2, TrendingDown, HelpCircle, MapPin, Flame } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";
import { getStockStatus, calculateAutonomy } from "@/lib/stock-utils";
import { AutonomyBadge } from "@/components/AutonomyBadge";
import { StockStatusBadge } from "@/components/StockStatusBadge";

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap z-10">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
};



const ArticlesPage = () => {
  const { articles, addArticle, updateArticle, deleteArticle, categories, getArticleLocations, mouvements } = useData();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [formData, setFormData] = useState({
    ref: "",
    nom: "",
    categorie: "",
    seuil: 0,
    unite: "paire",
    consommationJournaliere: 0,
  });

  // ============================================================================
  // HISTORIQUE DES CONSOMMATIONS JOURNALIÈRES
  // ============================================================================
  // Regroupe les sorties validées par DATE et par ARTICLE
  // Utilise .reduce() conceptuellement (via forEach + Map) pour une performance optimale
  // Format: [Date] | [Article] | [Total Consommé ce jour-là]
  // ============================================================================
  const consumptionHistory = useMemo(() => {
    interface HistoryEntry {
      date: string;
      dateObj: Date;
      article: string;
      ref: string;
      totalConsomme: number;
    }

    // Map pour regrouper les consommations par date + article
    const historyMap: Record<string, HistoryEntry> = {};

    // Parcourir TOUS les mouvements et regrouper les sorties validées
    mouvements.forEach(m => {
      // Filtrer uniquement les sorties validées (Terminé)
      if (m.type === "Sortie" && m.statut === "Terminé") {
        const dateStr = new Date(m.date).toDateString();
        const dateObj = new Date(m.date);
        // Clé unique: Date + Référence article
        const key = `${dateStr}|${m.ref}`;

        if (!historyMap[key]) {
          // Créer une nouvelle entrée pour cette date + article
          historyMap[key] = {
            date: dateStr,
            dateObj,
            article: m.article,
            ref: m.ref,
            totalConsomme: 0,
          };
        }
        // SOMME CUMULATIVE: ajouter la quantité au total du jour
        historyMap[key].totalConsomme += m.qte;
      }
    });

    // Convertir en array et trier par date DÉCROISSANTE (plus récent en premier)
    const history = Object.values(historyMap).sort(
      (a, b) => b.dateObj.getTime() - a.dateObj.getTime()
    );

    return history;
  }, [mouvements]); // RÉACTIVITÉ: se recalcule instantanément quand mouvements change

  const filtered = articles.filter(
    (a) =>
      a.nom.toLowerCase().includes(search.toLowerCase()) ||
      a.ref.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (article?: typeof articles[0]) => {
    if (article) {
      setFormData({
        ref: article.ref,
        nom: article.nom,
        categorie: article.categorie,
        seuil: article.seuil,
        unite: article.unite,
        consommationJournaliere: article.consommationJournaliere,
      });
      setEditingId(article.id);
    } else {
      setFormData({
        ref: "",
        nom: "",
        categorie: "",
        seuil: 0,
        unite: "paire",
        consommationJournaliere: 0,
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ref || !formData.nom) {
      setToast({ message: "Veuillez remplir tous les champs", type: "error" });
      return;
    }

    if (editingId) {
      updateArticle(editingId, formData);
      setToast({ message: "Article modifié avec succès", type: "success" });
    } else {
      // Le stock est automatiquement initialisé à 0 lors de la création
      addArticle({ ...formData, stock: 0, consommationParInventaire: 0, locations: [] });
      setToast({ message: "Article ajouté avec succès", type: "success" });
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      deleteArticle(id);
      setToast({ message: "Article supprimé avec succès", type: "success" });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Articles</h2>
          <p className="text-sm text-muted-foreground">{articles.length} articles enregistrés</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un article..."
          className="w-full h-9 pl-9 pr-3 rounded-md border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Réf</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Article</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Catégorie</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Emplacement</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stock</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Seuil</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Temps Restant</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <Tooltip text="Dernier ajustement suite à l'inventaire physique">
                    <div className="flex items-center justify-center gap-1">
                      <span>Consommation par Inventaire</span>
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                  </Tooltip>
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const status = getStockStatus(a.stock, a.seuil, a.consommationJournaliere);
                const autonomy = calculateAutonomy(a.stock, a.consommationJournaliere);
                return (
                  <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{a.ref}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{a.nom}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{a.categorie}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {getArticleLocations(a.ref).length > 0 ? (
                          getArticleLocations(a.ref).map((loc, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                              <MapPin className="w-3 h-3" />
                              {loc.emplacementNom}: {loc.quantite.toLocaleString()}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">Non localisé</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">{a.stock.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground hidden sm:table-cell">{a.seuil}</td>
                    <td className="py-3 px-4 text-center">
                      <AutonomyBadge autonomy={autonomy} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StockStatusBadge status={status} autonomyLabel={autonomy.label} dailyConsumption={a.consommationJournaliere} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {a.consommationParInventaire < 0 ? (
                          <>
                            <TrendingDown className="w-4 h-4 text-orange-500" />
                            <span className={`font-mono font-semibold text-orange-500`}>
                              {a.consommationParInventaire}
                            </span>
                          </>
                        ) : (
                          <span className={`font-mono font-semibold ${a.consommationParInventaire === 0 ? "text-success" : "text-info"}`}>
                            {a.consommationParInventaire > 0 ? "+" : ""}{a.consommationParInventaire}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(a)}
                          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historique des Consommations Journalières */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">📅 Historique des Consommations Journalières</span>
          <span className="text-xs text-muted-foreground">({consumptionHistory.length} entrées)</span>
        </div>

        {consumptionHistory.length > 0 ? (
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Référence</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Article</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      <div className="flex items-center justify-end gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Total Consommé</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {consumptionHistory.map((entry, idx) => {
                    // Déterminer si c'est aujourd'hui
                    const today = new Date().toDateString();
                    const isToday = entry.date === today;
                    
                    return (
                      <tr 
                        key={idx} 
                        className={`border-b border-border/50 transition-colors ${
                          isToday 
                            ? "bg-orange-50/50 hover:bg-orange-100/50" 
                            : "hover:bg-muted/30"
                        }`}
                      >
                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {isToday && <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />}
                            {entry.date}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{entry.ref}</td>
                        <td className="py-3 px-4 text-foreground font-medium">{entry.article}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${
                            isToday
                              ? "bg-orange-100 text-orange-800 border-orange-200"
                              : "bg-blue-100 text-blue-800 border-blue-200"
                          }`}>
                            {entry.totalConsomme.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-card border rounded-lg p-8 text-center">
            <p className="text-muted-foreground text-sm">Aucune consommation enregistrée pour le moment.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Modifier l'article" : "Ajouter un article"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Référence</label>
            <input
              type="text"
              value={formData.ref}
              onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: GN-M-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: Gants Nitrile M"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Catégorie</label>
            <select
              value={formData.categorie}
              onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.nom}>
                  {cat.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Seuil</label>
            <input
              type="number"
              inputMode="numeric"
              value={formData.seuil === 0 ? '' : formData.seuil}
              onChange={(e) => setFormData({ ...formData, seuil: Number(e.target.value) || 0 })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Unité</label>
            <select
              value={formData.unite}
              onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="paire">Paire</option>
              <option value="unité">Unité</option>
              <option value="boîte">Boîte</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Consommation Journalière Estimée (CJE)</label>
            <input
              type="number"
              inputMode="numeric"
              value={formData.consommationJournaliere === 0 ? '' : formData.consommationJournaliere}
              onChange={(e) => setFormData({ ...formData, consommationJournaliere: Number(e.target.value) || 0 })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: 50 unités/jour"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 h-9 rounded-md border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {editingId ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default ArticlesPage;
