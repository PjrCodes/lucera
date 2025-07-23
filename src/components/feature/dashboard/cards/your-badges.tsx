import React from "react";
import Link from "next/link";
import { SessionAndDataProps } from "@/lib/interfaces/props";
import { Award } from "lucide-react";

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

const YourBadges: React.FC<SessionAndDataProps> = ({}) => {
  // Use userData.badges if present, otherwise fallback to mockBadges
  // const badges =
  // 	userData.badges && userData.badges.length > 0 ? userData.badges : mockBadges;
  const badges = mockBadges; // Replace with userData.badges when available
  if (!badges.length) {
    return (
      <div className="rounded-lg shadow-md p-4 md:px-6 min-h-[250px] border-2 border-primary-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          </div>
          <div className="flex flex-col text-sm sm:text-base text-primary-700">
            <h2 className="font-bold text-primary-700 gap-2 text-lg">
              Your Badges
            </h2>
            <p className="text-primary-500">
              Earn badges by completing milestones.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center text-center text-primary-700 h-full min-h-[150px]">
          You have not earned any badges yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-md p-4 md:px-6 min-h-[250px] border-2 border-primary-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
        </div>
        <div className="flex flex-col text-sm sm:text-base text-primary-700">
          <h2 className="font-bold text-primary-700 gap-2 text-lg">
            Your Badges
          </h2>
          <p className="text-primary-500">
            Earn badges by completing milestones.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
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
              className="block"
            >
              <div
                className={`flex flex-col md:flex-row items-center gap-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-3 cursor-pointer bg-primary-100/40`}
                title={badge.description}
              >
                <div
                  className={`flex items-center justify-center text-2xl ${
                    !badge.collected ? "grayscale" : ""
                  }`}
                >
                  {badge.emoji}
                </div>
                <div className="flex flex-col flex-1">
                  <span
                    className={`font-medium text-sm ${
                      badge.collected
                        ? "text-primary-700"
                        : "text-secondary-500"
                    }`}
                  >
                    {badge.name}
                  </span>
                  <span
                    className={`text-xs ${
                      badge.collected
                        ? "text-primary-600"
                        : "text-secondary-400"
                    }`}
                  >
                    {badge.description}
                  </span>
                </div>
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  );
};

export default YourBadges;
