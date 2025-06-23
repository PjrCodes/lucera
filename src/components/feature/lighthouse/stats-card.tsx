import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "primary" | "secondary";
  subtitle?: string;
  onClick?: () => void;
  clickable?: boolean;
}

const colorClasses = {
  primary: "bg-primary-100 text-primary-800 border-primary-200",
  secondary: "bg-secondary-100 text-secondary-800 border-secondary-200",
};

const iconColorClasses = {
  primary: "text-primary-600",
  secondary: "text-secondary-600",
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  onClick,
  clickable = false
}) => {
  const baseClasses = `${colorClasses[color]} rounded-lg shadow-md p-6 border transition-all duration-200`;
  const interactiveClasses = clickable
    ? "hover:shadow-lg cursor-pointer hover:scale-105 active:scale-95"
    : "hover:shadow-lg";

  return (
    <div
      className={`${baseClasses} ${interactiveClasses}`}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm mb-1 opacity-80">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs opacity-70 mt-1">{subtitle}</p>
          )}
        </div>
        <Icon className={`w-8 h-8 ${iconColorClasses[color]}`} />
      </div>
    </div>
  );
};

export default StatsCard;
