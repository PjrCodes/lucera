import React from "react";

interface Badge {
  id: number;
  name: string;
  emoji: string;
  collected: boolean;
  description?: string;
}

interface BadgeGridProps {
  badges: Badge[];
  onBadgeClick: (badge: Badge) => void;
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ badges, onBadgeClick }) => {
  return (
    <div id="badges-section" className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-bold text-secondary-800 mb-4">Badge Collection</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            onClick={() => onBadgeClick(badge)}
            className={`p-4 rounded-lg border-2 text-center transition-all duration-200 cursor-pointer hover:scale-105 ${
              badge.collected
                ? "bg-primary-100 border-primary-300 shadow-sm hover:shadow-md"
                : "bg-gray-50 border-gray-200 opacity-60 hover:opacity-80"
            }`}
          >
            <div className={`text-3xl mb-2 ${!badge.collected ? "grayscale" : ""}`}>
              {badge.emoji}
            </div>
            <p className={`font-medium text-sm ${badge.collected ? "text-primary-800" : "text-gray-500"}`}>
              {badge.name}
            </p>
            {badge.description && badge.collected && (
              <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgeGrid;
