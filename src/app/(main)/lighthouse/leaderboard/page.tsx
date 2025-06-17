"use client";
import React, { useState } from "react";
import { Trophy, Medal, Star, Filter } from "lucide-react";
import SetHeaderClientComponent from "@/components/feature/header/set-header-client-component";

interface LeaderboardEntry {
  id: number;
  name: string;
  points: number;
  badges: number;
  rank: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

interface Course {
  code: string;
  name: string;
}

export default function LeaderboardPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("university");

  const courses: Course[] = [
    { code: "CS101", name: "Introduction to Programming" },
    { code: "CS201", name: "Data Structures" },
    { code: "CS301", name: "Algorithms" },
    { code: "CS401", name: "Software Engineering" },
  ];

  // Dummy leaderboard data
  const universityLeaderboard: LeaderboardEntry[] = [
    { id: 1, name: "Alice Johnson", points: 4250, badges: 12, rank: 1 },
    { id: 2, name: "Bob Chen", points: 3980, badges: 11, rank: 2 },
    { id: 3, name: "Carol Davis", points: 3750, badges: 10, rank: 3 },
    { id: 4, name: "David Wilson", points: 3200, badges: 9, rank: 4 },
    { id: 5, name: "Emma Brown", points: 3100, badges: 8, rank: 5 },
    { id: 6, name: "Frank Miller", points: 2950, badges: 8, rank: 6 },
    { id: 7, name: "Grace Lee", points: 2900, badges: 7, rank: 7 },
    { id: 8, name: "Henry Taylor", points: 2880, badges: 7, rank: 8 },
    { id: 9, name: "Ivy Zhang", points: 2875, badges: 6, rank: 9 },
    { id: 10, name: "Jack Smith", points: 2860, badges: 6, rank: 10 },
    { id: 11, name: "Kate Anderson", points: 2855, badges: 5, rank: 11 },
    { id: 12, name: "Liam Garcia", points: 2850, badges: 5, rank: 12 },
    { id: 13, name: "Mia Rodriguez", points: 2848, badges: 4, rank: 13 },
    { id: 14, name: "Noah Martinez", points: 2847, badges: 4, rank: 14 },
    { id: 15, name: "You", points: 2847, badges: 4, rank: 15, isCurrentUser: true },
    { id: 16, name: "Olivia Thompson", points: 2845, badges: 4, rank: 16 },
    { id: 17, name: "Paul White", points: 2840, badges: 3, rank: 17 },
    { id: 18, name: "Quinn Davis", points: 2835, badges: 3, rank: 18 },
    { id: 19, name: "Ruby Johnson", points: 2830, badges: 2, rank: 19 },
    { id: 20, name: "Sam Wilson", points: 2825, badges: 2, rank: 20 },
  ];

  const courseLeaderboards: Record<string, LeaderboardEntry[]> = {
    CS101: [
      { id: 1, name: "Bob Chen", points: 485, badges: 3, rank: 1 },
      { id: 2, name: "Alice Johnson", points: 470, badges: 3, rank: 2 },
      { id: 3, name: "Carol Davis", points: 450, badges: 2, rank: 3 },
      { id: 4, name: "David Wilson", points: 440, badges: 2, rank: 4 },
      { id: 5, name: "You", points: 425, badges: 2, rank: 5, isCurrentUser: true },
    ],
    CS201: [
      { id: 1, name: "Alice Johnson", points: 420, badges: 2, rank: 1 },
      { id: 2, name: "Emma Brown", points: 410, badges: 2, rank: 2 },
      { id: 3, name: "Carol Davis", points: 400, badges: 1, rank: 3 },
      { id: 4, name: "You", points: 380, badges: 1, rank: 12, isCurrentUser: true },
    ],
    CS301: [
      { id: 1, name: "Frank Miller", points: 450, badges: 3, rank: 1 },
      { id: 2, name: "Grace Lee", points: 430, badges: 2, rank: 2 },
      { id: 3, name: "You", points: 402, badges: 1, rank: 8, isCurrentUser: true },
    ],
    CS401: [
      { id: 1, name: "Alice Johnson", points: 480, badges: 3, rank: 1 },
      { id: 2, name: "Bob Chen", points: 460, badges: 2, rank: 2 },
      { id: 3, name: "You", points: 445, badges: 2, rank: 3, isCurrentUser: true },
    ],
  };

  const getCurrentLeaderboard = (): LeaderboardEntry[] => {
    if (selectedCourse === "university") {
      return universityLeaderboard;
    }
    return courseLeaderboards[selectedCourse] || [];
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-gray-600 font-bold">#{rank}</span>;
  };

  return (
    <>
      <SetHeaderClientComponent title="LEADERBOARD" />
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-lucerablue-1 text-lucerablue-5 px-8 py-4 rounded-lg shadow-md border border-lucerablue-2">
              <Trophy className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Leaderboard</h1>
                <p className="text-sm opacity-80">See how you rank against others</p>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-800">Filter by Course</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCourse("university")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCourse === "university"
                    ? "bg-lucerablue-3 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                University Wide
              </button>
              {courses.map((course) => (
                <button
                  key={course.code}
                  onClick={() => setSelectedCourse(course.code)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCourse === course.code
                      ? "bg-lucerablue-3 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {course.code}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-lucerablue-1 border-b">
              <h2 className="font-bold text-lucerablue-5">
                {selectedCourse === "university"
                  ? "University Leaderboard"
                  : `${selectedCourse} Leaderboard`}
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {getCurrentLeaderboard().map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    entry.isCurrentUser ? "bg-lucerayellow-1 border-l-4 border-lucerayellow-4" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {getRankIcon(entry.rank)}
                    <div>
                      <h3 className={`font-semibold ${entry.isCurrentUser ? "text-lucerayellow-5" : "text-gray-800"}`}>
                        {entry.name}
                        {entry.isCurrentUser && <span className="ml-2 text-xs font-normal">(You)</span>}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-lucerayellow-4" />
                        <span className="font-bold">{entry.points.toLocaleString()}</span>
                      </div>
                      <span className="text-gray-500 text-xs">points</span>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{entry.badges}</div>
                      <span className="text-gray-500 text-xs">badges</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
