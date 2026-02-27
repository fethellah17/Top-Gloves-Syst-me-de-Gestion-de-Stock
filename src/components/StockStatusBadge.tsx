import React from "react";
import { AlertCircle } from "lucide-react";
import { StockStatus } from "@/lib/stock-utils";

interface StockStatusBadgeProps {
  status: StockStatus;
  autonomyLabel: string;
  dailyConsumption: number;
}

export const StockStatusBadge = ({ status, autonomyLabel, dailyConsumption }: StockStatusBadgeProps) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${status.bgColor} flex items-center justify-center gap-1`}>
          {status.level === "critical" && <AlertCircle className="w-3 h-3" />}
          {status.label}
        </span>
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap z-10">
          Basé sur une consommation de {dailyConsumption} unités par jour
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
};
