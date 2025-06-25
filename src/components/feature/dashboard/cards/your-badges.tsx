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
		id: 2,
		name: "Night Owl",
		emoji: "🦉",
		collected: false,
		description: "Used the platform after midnight.",
	},
	{
		id: 3,
		name: "Quiz Master",
		emoji: "🧠",
		collected: true,
		description: "Scored 100% on a quiz.",
	},
	{
		id: 4,
		name: "Helper",
		emoji: "🤝",
		collected: false,
		description: "Helped a classmate in the forum.",
	},
];

const YourBadges: React.FC<PropsForEveryDashboardCard> = ({}) => {
	// Use userData.badges if present, otherwise fallback to mockBadges
	// const badges =
	// 	userData.badges && userData.badges.length > 0 ? userData.badges : mockBadges;
  const badges = mockBadges; // Replace with userData.badges when available
	if (!badges.length) {
		return (
			<div className="bg-primary-100 rounded-lg shadow-md p-4 flex items-center justify-center text-center text-gray-500 h-full min-h-[200px]">
				You have not earned any badges yet.
			</div>
		);
	}

	return (
		<div className="bg-primary-100 rounded-lg shadow-md p-4 px-6 flex flex-col min-h-[200px]">
			<h2 className="text-lg font-bold mb-4 text-primary-700">
				YOUR BADGES
			</h2>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full justify-items-center">
				{badges.map((badge: { id: number; name: string; emoji: string; collected: boolean; description: string; }) => (
					<Link
						href="/lighthouse"
						key={badge.id}
						tabIndex={-1}
						className="contents"
					>
						<div
							className={`flex flex-col items-center justify-center rounded-lg shadow p-4 cursor-pointer transition-all duration-200 border-2 ${
								badge.collected
									? "bg-lucerayellow-1 border-lucerayellow-3 hover:shadow-md"
									: "bg-gray-50 border-gray-200 opacity-60 hover:opacity-80"
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
								className={`font-medium text-sm text-center ${
									badge.collected
										? "text-lucerayellow-5"
										: "text-gray-500"
								}`}
							>
								{badge.name}
							</span>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
};

export default YourBadges;
