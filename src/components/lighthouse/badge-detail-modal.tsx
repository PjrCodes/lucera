import React from "react";
import { X, CheckCircle, Lock } from "lucide-react";

interface Badge {
  id: number;
  name: string;
  emoji: string;
  collected: boolean;
  description?: string;
  requirement?: string;
  points?: number;
}

interface BadgeDetailModalProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
}

const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ badge, isOpen, onClose }) => {
  if (!isOpen || !badge) return null;

  const badgeDetails: Record<string, { requirement: string; points: number; longDescription: string }> = {
    "First Steps": {
      requirement: "Complete your first course module",
      points: 50,
      longDescription: "Welcome to your learning journey! This badge is awarded when you take your first steps into the world of knowledge by completing your very first course module."
    },
    "Speed Demon": {
      requirement: "Submit 5 assignments before the deadline",
      points: 100,
      longDescription: "You're quick on your feet! This badge recognizes students who consistently submit their work early, demonstrating excellent time management skills."
    },
    "Scholar": {
      requirement: "Maintain an average grade of 85% or higher",
      points: 200,
      longDescription: "Academic excellence at its finest! This prestigious badge is awarded to students who maintain consistently high grades across their courses."
    },
    "Night Owl": {
      requirement: "Complete 10 activities between 10 PM and 6 AM",
      points: 75,
      longDescription: "Burning the midnight oil! This badge celebrates the dedicated night studiers who put in extra hours when others are sleeping."
    },
    "Perfectionist": {
      requirement: "Score 100% on 3 different assignments",
      points: 150,
      longDescription: "Flawless execution! This badge is for students who demand nothing less than perfection from themselves and achieve it multiple times."
    },
    "Team Player": {
      requirement: "Participate in 5 group projects or discussions",
      points: 125,
      longDescription: "Collaboration champion! This badge recognizes students who actively contribute to group work and foster a collaborative learning environment."
    },
    "Mastermind": {
      requirement: "Solve 20 complex problem-solving challenges",
      points: 250,
      longDescription: "Strategic thinking at its best! This elite badge is awarded to students who excel at tackling complex problems and finding innovative solutions."
    },
    "Explorer": {
      requirement: "Access 50 different course materials",
      points: 100,
      longDescription: "Curiosity drives learning! This badge celebrates students who explore beyond the required materials, diving deep into additional resources."
    },
  };

  const details = badgeDetails[badge.name] || {
    requirement: "Complete specific learning objectives",
    points: 50,
    longDescription: "This badge recognizes achievement in a specific area of learning."
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className={`text-4xl ${!badge.collected ? "grayscale" : ""}`}>
                {badge.emoji}
              </span>
              <h2 className="text-xl font-bold text-gray-800">{badge.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Status */}
          <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg ${
            badge.collected 
              ? "bg-luceragreen-1 text-luceragreen-5" 
              : "bg-gray-100 text-gray-600"
          }`}>
            {badge.collected ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
            <span className="font-medium">
              {badge.collected ? "Badge Earned!" : "Not Earned Yet"}
            </span>
          </div>

          {/* Description */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {details.longDescription}
            </p>
          </div>

          {/* Requirement */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">How to Earn</h3>
            <p className="text-gray-600 text-sm">
              {details.requirement}
            </p>
          </div>

          {/* Points */}
          <div className="bg-lucerayellow-1 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-lucerayellow-5 font-medium">Points Reward</span>
              <span className="text-lucerayellow-5 font-bold">{details.points} pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeDetailModal;
