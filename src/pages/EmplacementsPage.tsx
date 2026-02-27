import { MapPin, Plus, Edit, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";

const EmplacementsPage = () => {
  const { emplacements, addEmplacement, updateEmplacement, deleteEmplacement, articles, calculateEmplacementOccupancy } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    nom: "",
    capacite: 0,
    occupe: 0,
  });

  // Rafraîchir l'occupation en temps réel
  useEffect(() => {
    const timer = setInterval(() => {
      // Force re-render pour synchroniser les données
      setSelectedLocation(prev => prev);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const handleOpenModal = (emplacement?: typeof emplacements[0]) => {
    if (emplacement) {
      const calculatedOccupancy = calculateEmplacementOccupancy(emplacement.nom);
      setFormData({
        code: emplacement.code,
        nom: emplacement.nom,
        capacite: emplacement.capacite,
        occupe: calculatedOccupancy,
      });
      setEditingId(emplacement.id);
    } else {
      setFormData({ code: "", nom: "", capacite: 0, occupe: 0 });
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
    if (!formData.code || !formData.nom) {
      setToast({ message: "Veuillez remplir tous les champs", type: "error" });
      return;
    }

    if (editingId) {
      // Don't update occupe field - it's calculated automatically
      updateEmplacement(editingId, {
        code: formData.code,
        nom: formData.nom,
        type: "Stockage",
        capacite: formData.capacite,
      });
      setToast({ message: "Emplacement modifié avec succès", type: "success" });
    } else {
      // For new emplacements, calculate occupancy based on articles
      const calculatedOccupancy = calculateEmplacementOccupancy(formData.nom);
      addEmplacement({
        code: formData.code,
        nom: formData.nom,
        type: "Stockage",
        capacite: formData.capacite,
        occupe: calculatedOccupancy,
      });
      setToast({ message: "Emplacement ajouté avec succès", type: "success" });
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet emplacement ?")) {
      deleteEmplacement(id);
      setToast({ message: "Emplacement supprimé avec succès", type: "success" });
    }
  };

  // Récupérer les articles d'une zone spécifique
  const getArticlesInLocation = (locationName: string) => {
    return articles
      .map(article => {
        const location = article.locations.find(l => l.emplacementNom === locationName);
        if (location && location.quantite > 0) {
          return {
            ref: article.ref,
            nom: article.nom,
            quantite: location.quantite,
            unite: article.unite,
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Emplacements</h2>
          <p className="text-sm text-muted-foreground">{emplacements.length} emplacements</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {emplacements.map((loc) => {
          const calculatedOccupancy = calculateEmplacementOccupancy(loc.nom);
          const occupancyPercent = Math.round((calculatedOccupancy / loc.capacite) * 100);
          const occupancyStatus = occupancyPercent > 90 ? "critical" : occupancyPercent > 70 ? "warning" : "good";
          
          return (
          <div 
            key={loc.id} 
            className="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer hover:border-accent/50"
            onClick={() => setSelectedLocation(loc.nom)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{loc.nom}</h3>
                  <span className="text-xs font-mono text-muted-foreground">{loc.code}</span>
                </div>
              </div>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleOpenModal(loc)}
                  className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(loc.id)}
                  className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-3 ${
              loc.type === "Quarantaine" ? "status-red" : loc.type === "Expédition" ? "status-yellow" : "status-green"
            }`}>
              {loc.type}
            </span>
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Occupation</span>
                <span className={`font-mono font-medium ${
                  occupancyStatus === "critical" ? "text-destructive" : 
                  occupancyStatus === "warning" ? "text-orange-500" : 
                  "text-success"
                }`}>
                  {occupancyPercent}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    occupancyStatus === "critical" ? "bg-destructive" : 
                    occupancyStatus === "warning" ? "bg-orange-500" : 
                    "bg-success"
                  }`}
                  style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                {calculatedOccupancy.toLocaleString()} / {loc.capacite.toLocaleString()} unités
              </p>
            </div>
          </div>
        );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Modifier l'emplacement" : "Ajouter un emplacement"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: A-12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: Zone A - Rack 12"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Capacité</label>
              <input
                type="number"
                inputMode="numeric"
                value={formData.capacite === 0 ? '' : formData.capacite}
                onChange={(e) => setFormData({ ...formData, capacite: Number(e.target.value) || 0 })}
                className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Occupé (Calculé automatiquement)</label>
              <input
                type="number"
                inputMode="numeric"
                value={formData.occupe === 0 ? '' : formData.occupe}
                disabled
                className="w-full h-9 px-3 rounded-md border bg-muted text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
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

      {/* Drawer pour afficher le détail des stocks */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div 
            className="flex-1 bg-black/50 transition-opacity"
            onClick={() => setSelectedLocation(null)}
          />
          
          {/* Drawer */}
          <div className="w-full max-w-2xl bg-background shadow-lg flex flex-col animate-in slide-in-from-right">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-bold text-foreground">Contenu de {selectedLocation}</h2>
                <p className="text-sm text-muted-foreground mt-1">Détail des articles présents dans cette zone</p>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {(() => {
                const articlesInLocation = getArticlesInLocation(selectedLocation);
                const totalArticles = articlesInLocation.length;
                const totalUnits = articlesInLocation.reduce((sum, a) => sum + a.quantite, 0);

                return (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                        <p className="text-xs text-muted-foreground mb-1">Articles différents</p>
                        <p className="text-2xl font-bold text-accent">{totalArticles}</p>
                      </div>
                      <div className="bg-success/10 rounded-lg p-4 border border-success/20">
                        <p className="text-xs text-muted-foreground mb-1">Unités totales</p>
                        <p className="text-2xl font-bold text-success">{totalUnits.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Table */}
                    {articlesInLocation.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted border-b">
                              <th className="px-4 py-3 text-left font-semibold text-foreground">Référence</th>
                              <th className="px-4 py-3 text-left font-semibold text-foreground">Désignation</th>
                              <th className="px-4 py-3 text-right font-semibold text-foreground">Quantité</th>
                            </tr>
                          </thead>
                          <tbody>
                            {articlesInLocation.map((article, idx) => (
                              <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-accent font-semibold">{article.ref}</td>
                                <td className="px-4 py-3 text-foreground">{article.nom}</td>
                                <td className="px-4 py-3 text-right">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent font-semibold">
                                    {article.quantite.toLocaleString()} {article.unite}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">Aucun article dans cette zone</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="border-t p-6 bg-muted/30">
              <button
                onClick={() => setSelectedLocation(null)}
                className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmplacementsPage;
