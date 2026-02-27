import React from "react";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { getStockStatus, calculateAutonomy } from "@/lib/stock-utils";
import { AutonomyBadge } from "@/components/AutonomyBadge";
import { StockStatusBadge } from "@/components/StockStatusBadge";

export const StockDashboard = () => {
  const { articles } = useData();

  const criticalItems = articles.filter(a => {
    const status = getStockStatus(a.stock, a.seuil, a.consommationJournaliere);
    return status.level === "critical";
  });

  const warningItems = articles.filter(a => {
    const status = getStockStatus(a.stock, a.seuil, a.consommationJournaliere);
    return status.level === "warning";
  });

  const secureItems = articles.filter(a => {
    const status = getStockStatus(a.stock, a.seuil, a.consommationJournaliere);
    return status.level === "secure";
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Articles Critiques</p>
              <p className="text-2xl font-bold text-red-700">{criticalItems.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Articles en Attention</p>
              <p className="text-2xl font-bold text-orange-700">{warningItems.length}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Articles Sécurisés</p>
              <p className="text-2xl font-bold text-green-700">{secureItems.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Critical Items Table */}
      {criticalItems.length > 0 && (
        <div className="bg-card border border-red-200 rounded-lg overflow-hidden">
          <div className="border-b bg-red-50 p-4">
            <h3 className="text-sm font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Articles Critiques - Action Requise
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Article</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Stock</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Seuil</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Autonomie</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">CJE</th>
                </tr>
              </thead>
              <tbody>
                {criticalItems.map(a => {
                  const autonomy = calculateAutonomy(a.stock, a.consommationJournaliere);
                  return (
                    <tr key={a.id} className="border-b border-red-100 hover:bg-red-50/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{a.nom}</p>
                          <p className="text-xs text-muted-foreground">{a.ref}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-red-600">{a.stock.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono text-muted-foreground">{a.seuil}</td>
                      <td className="py-3 px-4 text-center">
                        <AutonomyBadge autonomy={autonomy} />
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-sm">{a.consommationJournaliere} {a.unite}/j</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warning Items Table */}
      {warningItems.length > 0 && (
        <div className="bg-card border border-orange-200 rounded-lg overflow-hidden">
          <div className="border-b bg-orange-50 p-4">
            <h3 className="text-sm font-semibold text-orange-700">Articles en Attention</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Article</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Stock</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Seuil</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Autonomie</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">CJE</th>
                </tr>
              </thead>
              <tbody>
                {warningItems.map(a => {
                  const autonomy = calculateAutonomy(a.stock, a.consommationJournaliere);
                  return (
                    <tr key={a.id} className="border-b border-orange-100 hover:bg-orange-50/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{a.nom}</p>
                          <p className="text-xs text-muted-foreground">{a.ref}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-orange-600">{a.stock.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono text-muted-foreground">{a.seuil}</td>
                      <td className="py-3 px-4 text-center">
                        <AutonomyBadge autonomy={autonomy} />
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-sm">{a.consommationJournaliere} {a.unite}/j</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
