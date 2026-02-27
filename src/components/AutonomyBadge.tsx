import React from "react";
import { AutonomyInfo } from "@/lib/stock-utils";

interface AutonomyBadgeProps {
  autonomy: AutonomyInfo;
}

export const AutonomyBadge = ({ autonomy }: AutonomyBadgeProps) => {
  const getBgColor = () => {
    if (autonomy.days <= 3) return "bg-red-50 border-red-200";
    if (autonomy.days <= 7) return "bg-orange-50 border-orange-200";
    return "bg-green-50 border-green-200";
  };

  const getTextColor = () => {
    if (autonomy.days <= 3) return "text-red-600";
    if (autonomy.days <= 7) return "text-orange-600";
    return "text-green-600";
  };

  const getIcon = () => {
    if (autonomy.days <= 3) return "🔴";
    if (autonomy.days <= 7) return "🟠";
    return "🟢";
  };

  return (
    <div className="flex items-center justify-center gap-1">
      <span className="text-lg">{getIcon()}</span>
      <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${getBgColor()} ${getTextColor()}`}>
        {autonomy.label}
      </span>
    </div>
  );
};
