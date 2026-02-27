import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StockDashboard } from "@/components/StockDashboard";
import { MovementTable } from "@/components/MovementTable";
import { useData } from "@/contexts/DataContext";
import { useMemo } from "react";

const Dashboard = () => {
  const { articles, mouvements } = useData();

  // Calculer les statistiques dynamiquement
  const stats = useMemo(() => {
    // Date actuelle au format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // Filtrer les mouvements du jour
    const todayMovements = mouvements.filter(m => {
      const movementDate = m.date.split(' ')[0]; // Extraire YYYY-MM-DD
      return movementDate === today;
    });

    // Calculer les entrées du jour
    const entreesJour = todayMovements
      .filter(m => m.type === "Entrée")
      .reduce((sum, m) => sum + m.qte, 0);

    // Calculer les sorties du jour
    const sortiesJour = todayMovements
      .filter(m => m.type === "Sortie")
      .reduce((sum, m) => sum + m.qte, 0);

    // Calculer les transferts du jour
    const transfertsJour = todayMovements
      .filter(m => m.type === "Transfert")
      .reduce((sum, m) => sum + m.qte, 0);

    // Calculer le stock total
    const stockTotal = articles.reduce((sum, a) => sum + a.stock, 0);

    return [
      { 
        label: "Stock Total", 
        value: stockTotal.toLocaleString('fr-FR'), 
        icon: Package, 
        change: "", 
        up: true 
      },
      { 
        label: "Entrées du Jour", 
        value: entreesJour.toLocaleString('fr-FR'), 
        icon: ArrowDownToLine, 
        change: "", 
        up: true 
      },
      { 
        label: "Sorties du Jour", 
        value: sortiesJour.toLocaleString('fr-FR'), 
        icon: ArrowUpFromLine, 
        change: "", 
        up: false 
      },
      { 
        label: "Transferts du Jour", 
        value: transfertsJour.toLocaleString('fr-FR'), 
        icon: ArrowLeftRight, 
        change: "", 
        up: true 
      },
    ];
  }, [articles, mouvements]);

  // Calculer les données du graphique (derniers 6 jours)
  const movementData = useMemo(() => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];
      
      const dayMovements = mouvements.filter(m => {
        const movementDate = m.date.split(' ')[0];
        return movementDate === dateStr;
      });
      
      const entrees = dayMovements
        .filter(m => m.type === "Entrée")
        .reduce((sum, m) => sum + m.qte, 0);
      
      const sorties = dayMovements
        .filter(m => m.type === "Sortie")
        .reduce((sum, m) => sum + m.qte, 0);
      
      data.push({ jour: dayName, entrees, sorties });
    }
    
    return data;
  }, [mouvements]);

  // Récupérer les 5 derniers mouvements triés par date décroissante
  const recentMovements = useMemo(() => {
    return [...mouvements]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [mouvements]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Tableau de Bord</h2>
        <p className="text-sm text-muted-foreground">Vue d'ensemble du stock</p>
      </div>

      {/* Stock Predictive Dashboard */}
      <StockDashboard />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="w-[18px] h-[18px] text-primary" />
              </div>
              {s.change && (
                <span className={`text-xs font-medium flex items-center gap-1 ${s.up ? "text-success" : "text-danger"}`}>
                  {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {s.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4">
        {/* Movements chart */}
        <div className="bg-card border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Mouvements de la Semaine</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={movementData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
              <XAxis dataKey="jour" tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 50%)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(214, 20%, 88%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="entrees" name="Entrées" fill="hsl(152, 55%, 42%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sorties" name="Sorties" fill="hsl(210, 70%, 35%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-4">
        {/* Recent movements */}
        <div className="bg-card border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Derniers Mouvements</h3>
          <MovementTable movements={recentMovements} showActions={false} compact={true} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
