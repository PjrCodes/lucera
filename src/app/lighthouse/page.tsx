"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function LighthouseHome() {
  const [currentPoints] = useState(2847);
  const [currentRank] = useState(15);
  const [collectedBadges] = useState([
    { id: 1, name: "First Steps", emoji: "👶", collected: true },
    { id: 2, name: "Speed Demon", emoji: "⚡", collected: true },
    { id: 3, name: "Scholar", emoji: "🎓", collected: true },
    { id: 4, name: "Night Owl", emoji: "🦉", collected: false },
    { id: 5, name: "Perfectionist", emoji: "💎", collected: false },
    { id: 6, name: "Team Player", emoji: "🤝", collected: false },
    { id: 7, name: "Mastermind", emoji: "🧠", collected: true },
    { id: 8, name: "Explorer", emoji: "🗺️", collected: false },
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-20 right-20 w-60 h-60 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-15 animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-25 animate-ping delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header with Stats */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300">
            <span className="text-4xl animate-spin">🗼</span>
            <div>
              <h1 className="text-3xl font-black">LIGHTHOUSE</h1>
              <p className="text-sm font-bold opacity-80">Ready to dominate?</p>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Rank Points */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-600 p-6 rounded-2xl shadow-xl text-black transform hover:rotate-2 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Rank Points</h3>
                <p className="text-3xl font-black">
                  {currentPoints.toLocaleString()}
                </p>
              </div>
              <span className="text-4xl animate-bounce">✨</span>
            </div>
          </div>

          {/* Current Rank */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl shadow-xl text-white transform hover:-rotate-2 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Current Rank</h3>
                <p className="text-3xl font-black">#{currentRank}</p>
              </div>
              <span className="text-4xl animate-pulse">🏆</span>
            </div>
          </div>

          {/* Badges Collected */}
          <div className="bg-gradient-to-br from-green-400 to-blue-500 p-6 rounded-2xl shadow-xl text-white transform hover:rotate-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Badges</h3>
                <p className="text-3xl font-black">
                  {
                    collectedBadges.filter((b) => b.collected).length
                  }/{collectedBadges.length}
                </p>
              </div>
              <span className="text-4xl animate-spin">🏅</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link
            href="/lighthouse/minigames"
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center gap-2"
          >
            <span className="text-2xl">🎮</span>
            Play Minigames
          </Link>
          <Link
            href="/lighthouse/leaderboard"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center gap-2"
          >
            <span className="text-2xl">📊</span>
            Leaderboards
          </Link>
        </div>

        {/* Badges Collection */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Badge Collection
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {collectedBadges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-xl text-center transition-all duration-300 cursor-pointer ${
                  badge.collected
                    ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-black shadow-lg transform hover:scale-105"
                    : "bg-gray-700/50 text-gray-400 hover:bg-gray-600/50"
                }`}
              >
                <div
                  className={`text-4xl mb-2 ${
                    badge.collected ? "animate-bounce" : "grayscale"
                  }`}
                >
                  {badge.emoji}
                </div>
                <p className="font-bold text-sm">{badge.name}</p>
                {!badge.collected && (
                  <p className="text-xs opacity-70 mt-1">Not collected</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-full font-bold shadow-xl animate-pulse">
            <span className="text-lg">⚡ Ready for your next challenge?</span>
          </div>
        </div>
      </div>
    </main>
  );
}
