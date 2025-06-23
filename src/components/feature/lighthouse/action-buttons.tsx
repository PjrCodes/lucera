import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: "primary" | "secondary";
}

const colorClasses = {
  primary: "bg-primary-500 hover:bg-primary-600 text-white",
  secondary: "bg-secondary-500 hover:bg-secondary-600 text-white",
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
