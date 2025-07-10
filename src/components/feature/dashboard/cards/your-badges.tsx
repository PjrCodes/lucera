import React from "react";
import Link from "next/link";
import { PropsForEveryDashboardCard } from "@/lib/interfaces/props";

// Mock badge data for demonstration
const mockBadges = [
  {
    id: 1,
    name: "Early Bird",
    emoji: "🐦",
    collected: true,
    description: "Logged in before 8am!",
  },
  {
    id: 3,
    name: "Quiz Master",
    emoji: "🧠",
    collected: true,
    description: "Scored 100% on a quiz.",
  },
];

const YourBadges: React.FC<PropsForEveryDashboardCard> = ({}) => {
  // Use userData.badges if present, otherwise fallback to mockBadges
  // const badges =
  // 	userData.badges && userData.badges.length > 0 ? userData.badges : mockBadges;
  const badges = mockBadges; // Replace with userData.badges when available
  if (!badges.length) {
    return (
      <div className="bg-primary-100 rounded-lg shadow-md p-4 flex items-center justify-center text-center text-primary-700 h-full min-h-[200px]">
        You have not earned any badges yet.
      </div>
    );
  }

  return (
    <div className="bg-primary-100 rounded-lg shadow-md p-4 px-6 flex flex-col min-h-[200px]">
      <h2 className="text-lg font-bold mb-4 text-primary-700">YOUR BADGES</h2>
      <div className="flex flex-wrap gap-2 w-full justify-center items-start">
        {badges.map(
          (badge: {
            id: number;
            name: string;
            emoji: string;
            collected: boolean;
            description: string;
          }) => (
            <Link
              href="/lighthouse"
              key={badge.id}
              tabIndex={-1}
              className="contents"
            >
              <div
                className={`w-24 h-24 flex flex-col items-center justify-center rounded-lg shadow p-4 cursor-pointer transition-all duration-200 border-2 bg-white ${
                  badge.collected
                    ? "bg-primary-50 border-primary-400 hover:shadow-md"
                    : "bg-secondary-50 border-secondary-200 opacity-60 hover:opacity-80"
                }`}
                title={badge.name}
              >
                <div
                  className={`flex items-center justify-center text-3xl mb-2 ${
                    !badge.collected ? "grayscale" : ""
                  }`}
                >
                  {badge.emoji}
                </div>
                <span
                  className={`font-medium text-sm text-center mt-1 ${
                    badge.collected ? "text-primary-700" : "text-secondary-500"
                  }`}
                >
                  {badge.name}
                </span>
              </div>
            </Link>
          ),
        )}
      </div>
    </div>
  );
};

export default YourBadges;
