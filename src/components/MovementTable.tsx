import { Shield, Pencil, Trash2, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, FileEdit, CheckCircle2, AlertCircle } from "lucide-react";

interface Movement {
  id: number;
  date: string;
  article: string;
  ref: string;
  type: "Entrée" | "Sortie" | "Transfert" | "Ajustement";
  qte: number;
  emplacementSource?: string;
  emplacementDestination: string;
  operateur: string;
  statut?: string;
  controleur?: string;
  typeAjustement?: "Surplus" | "Manquant";
}

interface MovementTableProps {
  movements: Movement[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onQualityControl?: (id: number) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const MovementTable = ({ 
  movements, 
  onEdit, 
  onDelete, 
  onQualityControl,
  showActions = true,
  compact = false
}: MovementTableProps) => {
  
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

  const getStatusBadge = (mouvement: Movement) => {
    if (mouvement.type !== "Sortie" && mouvement.type !== "Ajustement") return null;
    
    switch (mouvement.statut) {
      case "En attente de validation Qualité":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800">
          <AlertCircle className="w-3 h-3" />
          En attente
        </span>;
      case "Terminé":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold status-green">
          <CheckCircle2 className="w-3 h-3" />
          Terminé
        </span>;
      case "Rejeté":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold status-red">
          <AlertCircle className="w-3 h-3" />
          Rejeté
        </span>;
      default:
        return null;
    }
  };

  const getSourceLabel = (mouvement: Movement) => {
    if (mouvement.type === "Sortie" || mouvement.type === "Transfert" || mouvement.type === "Ajustement") {
      return mouvement.emplacementSource || "N/A";
    }
    return "—";
  };

  const getDestinationLabel = (mouvement: Movement) => {
    if (mouvement.type === "Entrée" || mouvement.type === "Transfert") {
      return mouvement.emplacementDestination;
    }
    if (mouvement.type === "Sortie") {
      return mouvement.emplacementDestination;
    }
    if (mouvement.type === "Ajustement") {
      return "—";
    }
    return "N/A";
  };

  const getApprovedByLabel = (mouvement: Movement) => {
    if (mouvement.controleur) {
      return mouvement.controleur;
    }
    if (mouvement.type === "Entrée" || mouvement.type === "Ajustement") {
      return "Système";
    }
    if (mouvement.type === "Transfert") {
      return "N/A";
    }
    if (mouvement.type === "Sortie" && mouvement.statut === "En attente de validation Qualité") {
      return "En attente";
    }
    return "N/A";
  };

  if (compact) {
    // Version compacte pour le Dashboard
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-muted-foreground font-medium">Type</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Article</th>
              <th className="text-left py-2 text-muted-foreground font-medium hidden sm:table-cell">Source</th>
              <th className="text-left py-2 text-muted-foreground font-medium hidden md:table-cell">Destination</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Date</th>
              <th className="text-center py-2 text-muted-foreground font-medium hidden lg:table-cell">Statut</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-muted-foreground text-xs">
                  Aucun mouvement récent
                </td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      m.type === "Entrée" ? "status-green" 
                      : m.type === "Sortie" ? "status-yellow" 
                      : m.type === "Ajustement" ? "bg-purple-100 text-purple-800"
                      : "status-blue"
                    }`}>
                      {getMovementIcon(m.type)}
                      {m.type}
                    </span>
                  </td>
                  <td className="py-2.5 font-medium text-foreground">{m.article}</td>
                  <td className="py-2.5 text-muted-foreground hidden sm:table-cell">{getSourceLabel(m)}</td>
                  <td className="py-2.5 text-muted-foreground hidden md:table-cell">{getDestinationLabel(m)}</td>
                  <td className="py-2.5 text-right text-muted-foreground font-mono">{m.date.split(' ')[1]?.substring(0, 5) || "00:00"}</td>
                  <td className="py-2.5 text-center hidden lg:table-cell">{getStatusBadge(m)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // Version complète pour la page Mouvements
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Article</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quantité</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden xl:table-cell">Source</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Destination</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Statut</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Opérateur</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Approuvé par</th>
            {showActions && <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {movements.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 10 : 9} className="py-8 text-center text-muted-foreground">
                Aucun mouvement récent
              </td>
            </tr>
          ) : (
            movements.map((m) => (
              <tr key={m.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{m.date}</td>
                <td className="py-3 px-4">
                  <span className="font-medium text-foreground">{m.article}</span>
                  <span className="block text-[10px] text-muted-foreground font-mono">{m.ref}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    m.type === "Entrée" ? "status-green" 
                    : m.type === "Sortie" ? "status-yellow" 
                    : m.type === "Ajustement" ? "bg-purple-100 text-purple-800"
                    : "status-blue"
                  }`}>
                    {getMovementIcon(m.type)}
                    {m.type === "Ajustement" 
                      ? `Ajustement (${m.typeAjustement === "Surplus" ? "+" : "-"})`
                      : m.type
                    }
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">{m.qte.toLocaleString()}</td>
                <td className="py-3 px-4 text-muted-foreground text-xs hidden xl:table-cell">
                  <span className="font-medium">{getSourceLabel(m)}</span>
                </td>
                <td className="py-3 px-4 text-muted-foreground text-xs hidden md:table-cell">
                  <span className="font-medium">{getDestinationLabel(m)}</span>
                </td>
                <td className="py-3 px-4 text-center hidden sm:table-cell">{getStatusBadge(m)}</td>
                <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{m.operateur}</td>
                <td className="py-3 px-4 text-muted-foreground text-xs hidden lg:table-cell">
                  <span className={`${
                    getApprovedByLabel(m) === "En attente" ? "text-orange-600 font-medium" :
                    getApprovedByLabel(m) === "Système" ? "text-blue-600 font-medium" :
                    getApprovedByLabel(m) === "N/A" ? "text-muted-foreground/50" :
                    "text-foreground font-medium"
                  }`}>
                    {getApprovedByLabel(m)}
                  </span>
                </td>
                {showActions && (
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {m.type === "Sortie" && m.statut === "En attente de validation Qualité" && onQualityControl && (
                        <button
                          onClick={() => onQualityControl(m.id)}
                          className="p-1.5 rounded-md hover:bg-orange-100 transition-colors text-orange-600 hover:text-orange-800"
                          title="Passer le contrôle qualité"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(m.id)}
                          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(m.id)}
                          className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
