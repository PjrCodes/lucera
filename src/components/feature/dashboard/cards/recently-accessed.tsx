import React from "react";
import { FaClock } from "react-icons/fa";

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

const RecentlyAccessed: React.FC = () => {
	return (
		<div className="bg-primary-50 border border-primary-200 shadow-md rounded-lg">
			<div className="p-5">
				<div className="flex items-center mb-4">
					<FaClock className="text-primary-600 mr-2 text-xl" />
					<h2 className="text-xl font-semibold text-primary-800">
						Recently Accessed
					</h2>
				</div>
				<ul className="space-y-3">
					{recentlyAccessed.map((item) => (
						<li
							key={item.id}
							className="flex flex-col md:flex-row md:items-center md:justify-between bg-white/80 hover:bg-primary-100 transition rounded-md px-4 py-2"
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
};

export default RecentlyAccessed;
