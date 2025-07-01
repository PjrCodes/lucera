import { PropsForEveryDashboardCard } from "@/lib/interfaces/props";
import React from "react";

// Mocked data for recently accessed courses/resources
const recentlyAccessed = [
  {
    id: 1,
    title: "Knowledge Representation & Reasoning",
    type: "Course",
    accessedAt: "2025-06-15 10:30 AM",
    link: "/courses/view/knowledge-representation-reasoning",
  },
  {
    id: 2,
    title: "Geospatial Data Science",
    type: "Course",
    accessedAt: "2025-06-14 09:00 PM",
    link: "/courses/view/geospatial-data-science",
  },
  {
    id: 3,
    title: "RL Overview - Sandeep",
    type: "Resource",
    accessedAt: "2025-06-13 04:45 PM",
    link: "/resources/rl-overview-sandeep",
  },
];

export default function RecentlyAccessed({}: PropsForEveryDashboardCard) {
  return (
    <div className="bg-primary-100 border border-primary-200 shadow-md rounded-lg">
      <div className="p-5">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-bold text-primary-800">
            RECENTLY ACCESSED
          </h2>
        </div>
        <ul className="space-y-3">
          {recentlyAccessed.map((item) => (
            <li
              key={item.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between bg-white/80 transition rounded-md px-4 py-2 cursor-pointer shadow-sm hover:shadow-md"
            >
              <div>
                <a
                  href={item.link}
                  className="text-primary-700 font-medium hover:underline"
                >
                  {item.title}
                </a>
                <span className="ml-2 text-xs text-gray-500">
                  ({item.type})
                </span>
              </div>
              <span className="text-xs text-gray-400 mt-1 md:mt-0">
                Accessed: {item.accessedAt}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
