import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: "blue" | "green" | "purple" | "red" | "rose";
}

const colorClasses = {
  blue: "bg-lucerablue-3 hover:bg-lucerablue-4 text-white",
  green: "bg-luceragreen-3 hover:bg-luceragreen-4 text-white",
  purple: "bg-lucerapurple-3 hover:bg-lucerapurple-4 text-white", 
  red: "bg-lucerared-3 hover:bg-lucerared-4 text-white",
  rose: "bg-lucerarose-3 hover:bg-lucerarose-4 text-white",
};

const ActionButton: React.FC<ActionButtonProps> = ({ href, icon: Icon, title, description, color }) => {
  return (
    <Link
      href={href}
      className={`${colorClasses[color]} px-6 py-4 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-4 min-w-[200px]`}
    >
      <Icon className="w-6 h-6" />
      <div className="text-left">
        <h3 className="font-bold">{title}</h3>
        <p className="text-sm opacity-90">{description}</p>
      </div>
    </Link>
  );
};

export default ActionButton;
