import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, Plus, Search, Pencil, Trash2, Shield, CheckCircle2, AlertCircle, MapPin, FileEdit } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";
import { MovementTable } from "@/components/MovementTable";

const MouvementsPage = () => {
  const { mouvements, articles, emplacements, addMouvement, updateMouvement, deleteMouvement, getArticleLocations, getArticleStockByLocation, approveQualityControl, rejectQualityControl, processTransfer, recalculateAllOccupancies } = useData();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "Entrée" | "Sortie" | "Transfert" | "Ajustement">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQCModalOpen, setIsQCModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [qcMouvementId, setQCMouvementId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [formData, setFormData] = useState({
    articleId: "",
    type: "Entrée" as "Entrée" | "Sortie" | "Transfert" | "Ajustement",
    qte: 0,
    operateur: "",
    emplacementSource: "",
    emplacementDestination: "",
    motif: "",
    typeAjustement: "Manquant" as "Surplus" | "Manquant",
  });
  const [qcFormData, setQCFormData] = useState({
    etatArticles: "Conforme" as "Conforme" | "Non-conforme",
    unitesDefectueuses: 0,
    controleur: "",
    decision: "Approuver" as "Approuver" | "Rejeter",
    raison: "",
  });

  // Destinations possibles pour les sorties
  const destinationsUtilisation = [
    "Département Production",
    "Maintenance",
    "Expédition",
    "Destruction",
    "Retour Fournisseur",
  ];

  // Récupérer l'article sélectionné et ses emplacements
  const selectedArticle = articles.find(a => a.id === parseInt(formData.articleId));
  const articleLocations = selectedArticle ? getArticleLocations(selectedArticle.ref) : [];
  const sourceStockAvailable = formData.emplacementSource && selectedArticle ? getArticleStockByLocation(selectedArticle.ref, formData.emplacementSource) : 0;

  const filtered = mouvements
    .filter((m) => {
      const matchSearch = m.article.toLowerCase().includes(search.toLowerCase()) || m.ref.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || m.type === typeFilter;
      return matchSearch && matchType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleOpenModal = () => {
    setEditingId(null);
    setFormData({ 
      articleId: "", 
      type: "Entrée", 
      qte: 0, 
      operateur: "", 
      emplacementSource: "",
      emplacementDestination: "",
      motif: "",
      typeAjustement: "Manquant"
    });
    setIsModalOpen(true);
  };

  const handleEditMouvement = (id: number) => {
    const mouvement = mouvements.find(m => m.id === id);
    if (!mouvement) return;

    const article = articles.find(a => a.ref === mouvement.ref);
    setEditingId(id);
    setFormData({
      articleId: article?.id.toString() || "",
      type: mouvement.type,
      qte: mouvement.qte,
      operateur: mouvement.operateur,
      emplacementSource: mouvement.emplacementSource || "",
      emplacementDestination: mouvement.emplacementDestination,
      motif: mouvement.motif || "",
      typeAjustement: mouvement.typeAjustement || "Manquant",
    });
    setIsModalOpen(true);
  };

  const handleOpenQCModal = (id: number) => {
    setQCMouvementId(id);
    setQCFormData({
      etatArticles: "Conforme",
      unitesDefectueuses: 0,
      controleur: "",
      decision: "Approuver",
      raison: "",
    });
    setIsQCModalOpen(true);
  };

  const handleCloseQCModal = () => {
    setIsQCModalOpen(false);
    setQCMouvementId(null);
  };

  const handleSubmitQC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qcFormData.controleur) {
      setToast({ message: "Veuillez renseigner le nom du contrôleur", type: "error" });
      return;
    }

    if (qcFormData.decision === "Rejeter" && !qcFormData.raison) {
      setToast({ message: "Veuillez renseigner la raison du rejet", type: "error" });
      return;
    }

    if (qcMouvementId) {
      if (qcFormData.decision === "Approuver") {
        approveQualityControl(qcMouvementId, qcFormData.controleur, qcFormData.etatArticles, qcFormData.unitesDefectueuses);
        setToast({ message: "✓ Qualité validée. Stock mis à jour avec succès.", type: "success" });
      } else {
        rejectQualityControl(qcMouvementId, qcFormData.controleur, qcFormData.raison);
        setToast({ message: "✗ Sortie rejetée. Opération annulée.", type: "success" });
      }
      
      // Recalculer les occupations après l'approbation/rejet
      recalculateAllOccupancies();
      
      handleCloseQCModal();
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deleteMouvement(deleteConfirmId);
      setToast({ message: "Mouvement supprimé avec succès", type: "success" });
      setIsDeleteConfirmOpen(false);
      setDeleteConfirmId(null);
      
      // Recalculer les occupations après suppression
      recalculateAllOccupancies();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.articleId || !formData.qte || !formData.operateur) {
      setToast({ message: "Veuillez remplir tous les champs", type: "error" });
      return;
    }

    // Validation des champs conditionnels
    if (formData.type === "Entrée" && !formData.emplacementDestination) {
      setToast({ message: "Veuillez sélectionner un emplacement de destination", type: "error" });
      return;
    }

    if (formData.type === "Sortie") {
      if (!formData.emplacementSource) {
        setToast({ message: "Veuillez sélectionner un emplacement source", type: "error" });
        return;
      }
      if (!formData.emplacementDestination) {
        setToast({ message: "Veuillez sélectionner une destination/utilisation", type: "error" });
        return;
      }
      // Valider que la quantité ne dépasse pas le stock disponible dans l'emplacement source
      if (formData.qte > sourceStockAvailable) {
        setToast({ message: `La quantité dépasse le stock disponible dans cette zone. Disponible: ${sourceStockAvailable}`, type: "error" });
        return;
      }
    }

    if (formData.type === "Ajustement") {
      if (!selectedArticle) {
        setToast({ message: "Veuillez d'abord sélectionner un article", type: "error" });
        return;
      }
      // Vérifier que l'article a au moins un emplacement défini
      if (articleLocations.length === 0) {
        setToast({ message: "Cet article n'a aucun emplacement défini. Impossible d'effectuer un ajustement.", type: "error" });
        return;
      }
      if (!formData.emplacementSource) {
        setToast({ message: "Veuillez sélectionner un emplacement", type: "error" });
        return;
      }
      // Pour les ajustements "Manquant", valider que la quantité ne dépasse pas le stock disponible
      if (formData.typeAjustement === "Manquant") {
        if (formData.qte > sourceStockAvailable) {
          setToast({ message: `La quantité dépasse le stock disponible dans cette zone. Disponible: ${sourceStockAvailable}`, type: "error" });
          return;
        }
      }
    }

    if (formData.type === "Transfert") {
      if (!formData.emplacementSource || !formData.emplacementDestination) {
        setToast({ message: "Veuillez sélectionner les emplacements source et destination", type: "error" });
        return;
      }
      
      if (formData.emplacementSource === formData.emplacementDestination) {
        setToast({ message: "Les emplacements source et destination doivent être différents", type: "error" });
        return;
      }

      // Utiliser processTransfer pour valider et mettre à jour les emplacements
      const transferResult = processTransfer(selectedArticle!.ref, formData.emplacementSource, formData.qte, formData.emplacementDestination);
      if (!transferResult.success) {
        setToast({ message: transferResult.error || "Erreur lors du transfert", type: "error" });
        return;
      }
      
      // Recalculer toutes les occupations après le transfert
      recalculateAllOccupancies();
    }

    const article = articles.find(a => a.id === parseInt(formData.articleId));
    if (!article) {
      setToast({ message: "Article non trouvé", type: "error" });
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, "$3-$2-$1 $4:$5:$6");

    if (editingId) {
      updateMouvement(editingId, {
        type: formData.type,
        qte: formData.qte,
        operateur: formData.operateur,
        emplacementSource: formData.emplacementSource || undefined,
        emplacementDestination: formData.emplacementDestination,
      });
      setToast({ message: "Mouvement modifié avec succès", type: "success" });
    } else {
      addMouvement({
        date: dateStr,
        article: article.nom,
        ref: article.ref,
        type: formData.type,
        qte: formData.qte,
        emplacementSource: formData.emplacementSource || undefined,
        emplacementDestination: formData.emplacementDestination || "N/A",
        operateur: formData.operateur,
        motif: formData.motif || undefined,
        typeAjustement: formData.type === "Ajustement" ? formData.typeAjustement : undefined,
      });
      
      // Recalculer les occupations après chaque mouvement
      recalculateAllOccupancies();
      
      const message = formData.type === "Sortie" 
        ? "Sortie créée. En attente de validation Qualité."
        : formData.type === "Transfert"
        ? `✓ Transfert effectué avec succès. Les capacités des zones ont été recalculées.`
        : formData.type === "Ajustement"
        ? `✓ Ajustement d'inventaire (${formData.typeAjustement}) effectué. Stock mis à jour immédiatement.`
        : `Entrée de ${formData.qte} unités en ${formData.emplacementDestination}`;
      setToast({ message, type: "success" });
    }
    handleCloseModal();
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "Entrée":
        return <ArrowDownToLine className="w-3 h-3" />;
      case "Sortie":
        return <ArrowUpFromLine className="w-3 h-3" />;
      case "Transfert":
        return <ArrowRightLeft className="w-3 h-3" />;
      case "Ajustement":
        return <FileEdit className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Mouvements</h2>
          <p className="text-sm text-muted-foreground">Gestion des entrées, sorties et transferts</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nouveau Mouvement
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full h-9 pl-9 pr-3 rounded-md border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex rounded-md border overflow-hidden">
          {(["all", "Entrée", "Sortie", "Transfert", "Ajustement"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`h-9 px-3 text-xs font-medium transition-colors ${
                typeFilter === t ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {t === "all" ? "Tous" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <MovementTable 
          movements={filtered}
          onEdit={handleEditMouvement}
          onDelete={handleDeleteClick}
          onQualityControl={handleOpenQCModal}
          showActions={true}
          compact={false}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Modifier Mouvement" : "Nouveau Mouvement"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Article</label>
            <select
              value={formData.articleId}
              onChange={(e) => setFormData({ ...formData, articleId: e.target.value })}
              disabled={editingId !== null}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Sélectionner un article</option>
              {articles.map(a => (
                <option key={a.id} value={a.id}>{a.nom} ({a.ref})</option>
              ))}
            </select>
          </div>

          {/* Afficher les emplacements de l'article si un article est sélectionné */}
          {selectedArticle && articleLocations.length > 0 && (
            <div className="p-3 bg-muted/50 rounded-md border border-border/50 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground">Emplacements de l'Article</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {articleLocations.map((loc, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    {loc.emplacementNom}: {loc.quantite.toLocaleString()} {selectedArticle.unite}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Stock total: {selectedArticle.stock.toLocaleString()} {selectedArticle.unite}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Type de Mouvement</label>
            <div className="grid grid-cols-2 gap-2">
              {(["Entrée", "Sortie", "Transfert", "Ajustement"] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t, emplacementDestination: "", motif: "" })}
                  disabled={editingId !== null}
                  className={`h-9 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 ${
                    formData.type === t
                      ? t === "Entrée" ? "bg-success text-success-foreground" 
                        : t === "Sortie" ? "bg-warning text-warning-foreground" 
                        : t === "Transfert" ? "bg-info text-info-foreground"
                        : "bg-purple-600 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {getMovementIcon(t)}
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Quantité</label>
            <input
              type="number"
              inputMode="numeric"
              value={formData.qte === 0 ? '' : formData.qte}
              onChange={(e) => setFormData({ ...formData, qte: Number(e.target.value) || 0 })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0"
              min="1"
            />
          </div>

          {/* Entrée: Emplacement de Destination */}
          {formData.type === "Entrée" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Emplacement de Destination</label>
              <select
                value={formData.emplacementDestination}
                onChange={(e) => setFormData({ ...formData, emplacementDestination: e.target.value })}
                className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Sélectionner un emplacement</option>
                {emplacements.map(e => (
                  <option key={e.id} value={e.nom}>
                    {e.nom} ({e.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sortie: Emplacement Source (Dynamique) */}
          {formData.type === "Sortie" && selectedArticle && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Choisir l'Emplacement Source</label>
              <select
                value={formData.emplacementSource}
                onChange={(e) => setFormData({ ...formData, emplacementSource: e.target.value })}
                className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Sélectionner un emplacement</option>
                {articleLocations.map((loc, idx) => (
                  <option key={idx} value={loc.emplacementNom}>
                    {loc.emplacementNom} - {loc.quantite.toLocaleString()} {selectedArticle.unite}
                  </option>
                ))}
              </select>
              {formData.emplacementSource && (
                <p className="text-xs text-muted-foreground mt-1">
                  Stock disponible dans cette zone : {sourceStockAvailable.toLocaleString()} {selectedArticle.unite}
                </p>
              )}
            </div>
          )}

          {/* Sortie: Destination / Utilisation uniquement */}
          {formData.type === "Sortie" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Destination / Utilisation</label>
              <select
                value={formData.emplacementDestination}
                onChange={(e) => setFormData({ ...formData, emplacementDestination: e.target.value })}
                className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Sélectionner une destination</option>
                {destinationsUtilisation.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Transfert: Source et Destination */}
          {formData.type === "Transfert" && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Emplacement Source</label>
                <select
                  value={formData.emplacementSource}
                  onChange={(e) => setFormData({ ...formData, emplacementSource: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Sélectionner un emplacement</option>
                  {articleLocations.map((loc, idx) => (
                    <option key={idx} value={loc.emplacementNom}>
                      {loc.emplacementNom} ({loc.quantite.toLocaleString()} disponible)
                    </option>
                  ))}
                </select>
                {formData.emplacementSource && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Stock disponible: {sourceStockAvailable.toLocaleString()} {selectedArticle?.unite}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Emplacement de Destination</label>
                <select
                  value={formData.emplacementDestination}
                  onChange={(e) => setFormData({ ...formData, emplacementDestination: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Sélectionner un emplacement</option>
                  {emplacements.map(e => (
                    <option key={e.id} value={e.nom}>
                      {e.nom} ({e.code})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Ajustement: Type, Emplacement et Motif */}
          {formData.type === "Ajustement" && selectedArticle && (
            <>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                <p className="text-xs text-purple-800 font-medium">
                  ⚠️ Ajustement d'Inventaire - Bypass du Contrôle Qualité
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Le stock sera mis à jour immédiatement sans validation qualité.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Type d'Ajustement</label>
                <div className="flex gap-2">
                  {(["Surplus", "Manquant"] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, typeAjustement: type, emplacementSource: "" })}
                      className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                        formData.typeAjustement === type
                          ? type === "Surplus" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {type === "Surplus" ? "+" : "-"} {type} {type === "Surplus" ? "(Ajouter)" : "(Retirer)"}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.typeAjustement === "Surplus" 
                    ? "Ajouter du stock trouvé lors d'un inventaire" 
                    : "Retirer du stock manquant (casse, perte, vol)"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {formData.typeAjustement === "Surplus" ? "Emplacement de Destination" : "Emplacement Source"}
                </label>
                <select
                  value={formData.emplacementSource}
                  onChange={(e) => setFormData({ ...formData, emplacementSource: e.target.value })}
                  disabled={!selectedArticle || articleLocations.length === 0}
                  className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedArticle 
                      ? "Veuillez d'abord choisir un article" 
                      : articleLocations.length === 0
                        ? "Aucun emplacement défini pour cet article"
                        : "Sélectionner un emplacement"}
                  </option>
                  {/* Affichage UNIQUEMENT des emplacements de l'article (article.locations) */}
                  {selectedArticle && articleLocations.length > 0 && articleLocations.map((loc, idx) => (
                    <option key={idx} value={loc.emplacementNom}>
                      {loc.emplacementNom} - {loc.quantite.toLocaleString()} {selectedArticle.unite}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {!selectedArticle 
                    ? "Sélectionnez d'abord un article pour voir les emplacements disponibles."
                    : articleLocations.length === 0
                      ? "Cet article n'a aucun emplacement défini. Impossible d'effectuer un ajustement."
                      : formData.typeAjustement === "Surplus" 
                        ? "Choisir l'emplacement où ajouter le stock trouvé."
                        : formData.emplacementSource 
                          ? `Choisir l'emplacement où le stock est manquant. Stock disponible : ${sourceStockAvailable.toLocaleString()} ${selectedArticle.unite}`
                          : "Choisir l'emplacement où le stock est manquant."
                  }
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Motif (Optionnel)</label>
                <input
                  type="text"
                  value={formData.motif}
                  onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={formData.typeAjustement === "Surplus" 
                    ? "Ex: Inventaire réel, Erreur de comptage..." 
                    : "Ex: Casse, Perte, Vol, Erreur de comptage..."}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Opérateur</label>
            <input
              type="text"
              value={formData.operateur}
              onChange={(e) => setFormData({ ...formData, operateur: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Nom de l'opérateur"
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
              {editingId ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Delete */}
      <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirmer la suppression">
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Êtes-vous sûr de vouloir supprimer ce mouvement ? Cette action annulera son effet sur le stock de l'article.
          </p>
          <div className="flex gap-2 pt-4">
            <button
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="flex-1 h-9 rounded-md border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmDelete}
              className="flex-1 h-9 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>

      {/* Quality Control Modal */}
      <Modal isOpen={isQCModalOpen} onClose={handleCloseQCModal} title="Contrôle Qualité - Sortie">
        <form onSubmit={handleSubmitQC} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">État des Articles</label>
            <div className="flex gap-2">
              {(["Conforme", "Non-conforme"] as const).map(etat => (
                <button
                  key={etat}
                  type="button"
                  onClick={() => setQCFormData({ ...qcFormData, etatArticles: etat })}
                  className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors ${
                    qcFormData.etatArticles === etat
                      ? etat === "Conforme" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {etat}
                </button>
              ))}
            </div>
          </div>

          {qcFormData.etatArticles === "Non-conforme" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nombre d'unités défectueuses</label>
              <input
                type="number"
                inputMode="numeric"
                value={qcFormData.unitesDefectueuses === 0 ? '' : qcFormData.unitesDefectueuses}
                onChange={(e) => setQCFormData({ ...qcFormData, unitesDefectueuses: Number(e.target.value) || 0 })}
                className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                min="0"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom du Contrôleur</label>
            <input
              type="text"
              value={qcFormData.controleur}
              onChange={(e) => setQCFormData({ ...qcFormData, controleur: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Nom du contrôleur"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Décision</label>
            <div className="flex gap-2">
              {(["Approuver", "Rejeter"] as const).map(decision => (
                <button
                  key={decision}
                  type="button"
                  onClick={() => setQCFormData({ ...qcFormData, decision })}
                  className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors ${
                    qcFormData.decision === decision
                      ? decision === "Approuver" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {decision}
                </button>
              ))}
            </div>
          </div>

          {qcFormData.decision === "Rejeter" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Raison du Rejet</label>
              <textarea
                value={qcFormData.raison}
                onChange={(e) => setQCFormData({ ...qcFormData, raison: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Raison du rejet..."
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={handleCloseQCModal}
              className="flex-1 h-9 rounded-md border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`flex-1 h-9 rounded-md text-sm font-medium text-white transition-colors ${
                qcFormData.decision === "Approuver" ? "bg-success hover:opacity-90" : "bg-destructive hover:opacity-90"
              }`}
            >
              {qcFormData.decision === "Approuver" ? "Approuver la Sortie" : "Rejeter la Sortie"}
            </button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default MouvementsPage;
