import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ShieldCheck,
  Lock,
  Users,
  History,
  Settings,
  Download,
  Upload,
  FileSpreadsheet,
  LogOut,
} from "lucide-react";

const auditLogs = [
  { date: "2026-02-24 14:32", user: "Karim B.", action: "Entrée stock", detail: "Gants Nitrile M: +500" },
  { date: "2026-02-24 13:15", user: "Sara M.", action: "Sortie stock", detail: "Gants Latex S: -200" },
  { date: "2026-02-24 11:00", user: "Admin", action: "Modification article", detail: "Seuil GN-XL-004 mis à jour" },
  { date: "2026-02-24 09:30", user: "Admin", action: "Ajout emplacement", detail: "Zone F-01 créée" },
  { date: "2026-02-23 16:45", user: "Sara M.", action: "Inventaire", detail: "Écart détecté: SG-PE-005 (-15)" },
];

const AdminPage = () => {
  const { isAdmin, adminLogin, logoutAdmin } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!adminLogin(password)) {
      setError("Mot de passe admin incorrect");
    }
    setPassword("");
  };

  if (!isAdmin) {
    return (
      <div className="max-w-sm mx-auto mt-20">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Accès Admin</h2>
          <p className="text-sm text-muted-foreground mt-1">Authentification requise pour accéder à la zone d'administration</p>
        </div>
        <form onSubmit={handleAdminLogin} className="bg-card border rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Mot de passe Admin</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-md border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
            Accéder
          </button>
        </form>
        <p className="text-center text-[11px] text-muted-foreground mt-4">
          Mot de passe démo: <span className="font-mono">admin</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Zone Administration
          </h2>
          <p className="text-sm text-muted-foreground">Gestion avancée de la base de données</p>
        </div>
        <button
          onClick={logoutAdmin}
          className="h-9 px-4 border rounded-md text-sm font-medium flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Quitter Admin
        </button>
      </div>

      {/* Admin modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Settings, label: "Paramètres Système", desc: "Configuration générale" },
          { icon: Users, label: "Gestion Utilisateurs", desc: "Rôles et permissions" },
          { icon: History, label: "Historique Complet", desc: "Audit de toutes les actions" },
          { icon: FileSpreadsheet, label: "Import/Export", desc: "CSV et Excel" },
        ].map((mod) => (
          <button key={mod.label} className="bg-card border rounded-lg p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
              <mod.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">{mod.label}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <button className="h-9 px-4 border rounded-md text-sm font-medium flex items-center gap-2 text-foreground hover:bg-muted transition-colors">
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
        <button className="h-9 px-4 border rounded-md text-sm font-medium flex items-center gap-2 text-foreground hover:bg-muted transition-colors">
          <Upload className="w-4 h-4" />
          Importer Données
        </button>
      </div>

      {/* Audit logs */}
      <div className="bg-card border rounded-lg p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          Journal d'Audit (Dernières entrées)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Utilisateur</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Détail</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">{log.date}</td>
                  <td className="py-2.5 px-3 font-medium text-foreground">{log.user}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{log.action}</td>
                  <td className="py-2.5 px-3 text-muted-foreground text-xs hidden md:table-cell">{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
