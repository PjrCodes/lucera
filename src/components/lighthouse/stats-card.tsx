import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "red" | "yellow";
  subtitle?: string;
  onClick?: () => void;
  clickable?: boolean;
}

const colorClasses = {
  blue: "bg-lucerablue-1 text-lucerablue-5 border-lucerablue-2",
  green: "bg-luceragreen-1 text-luceragreen-5 border-luceragreen-2", 
  purple: "bg-lucerapurple-1 text-lucerapurple-5 border-lucerapurple-2",
  red: "bg-lucerared-1 text-lucerared-5 border-lucerared-2",
  yellow: "bg-lucerayellow-1 text-lucerayellow-5 border-lucerayellow-2",
};

const iconColorClasses = {
  blue: "text-lucerablue-4",
  green: "text-luceragreen-4",
  purple: "text-lucerapurple-4", 
  red: "text-lucerared-4",
  yellow: "text-lucerayellow-4",
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
