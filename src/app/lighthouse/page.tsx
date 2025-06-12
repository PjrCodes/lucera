"use client";
import React, { useState } from "react";
import { Trophy, Star, Users, GamepadIcon, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import StatsCard from "@/components/lighthouse/StatsCard";
import BadgeGrid from "@/components/lighthouse/BadgeGrid";
import CourseRankCard from "@/components/lighthouse/CourseRankCard";
import ActionButton from "@/components/lighthouse/ActionButton";
import BadgeDetailModal from "@/components/lighthouse/BadgeDetailModal";
import PointsInfoModal from "@/components/lighthouse/PointsInfoModal";
import SetHeaderClientComponent from "@/components/SetHeaderClientComponent";

interface Badge {
  id: number;
  name: string;
  emoji: string;
  collected: boolean;
  description?: string;
}

export default function LighthouseHome() {
  const router = useRouter();
  const [currentPoints] = useState(2847);
  const [currentRank] = useState(15);
  const [totalStudents] = useState(1250);
  
  // Modal states
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  
  const [collectedBadges] = useState<Badge[]>(
    [
      { id: 1, name: "First Steps", emoji: "👶", collected: true, description: "Completed first course" },
      { id: 2, name: "Speed Demon", emoji: "⚡", collected: true, description: "Fast assignment completion" },
      { id: 3, name: "Scholar", emoji: "🎓", collected: true, description: "High academic performance" },
      { id: 4, name: "Night Owl", emoji: "🦉", collected: false },
      { id: 5, name: "Perfectionist", emoji: "💎", collected: false },
      { id: 6, name: "Team Player", emoji: "🤝", collected: false },
      { id: 7, name: "Mastermind", emoji: "🧠", collected: true, description: "Problem solving expert" },
      { id: 8, name: "Explorer", emoji: "🗺️", collected: false },
    ]
  );

  const [courseRanks] = useState(
    [
      { courseCode: "CS101", courseName: "Introduction to Programming", rank: 5, points: 425, totalStudents: 85 },
      { courseCode: "CS201", courseName: "Data Structures", rank: 12, points: 380, totalStudents: 72 },
      { courseCode: "CS301", courseName: "Algorithms", rank: 8, points: 402, totalStudents: 65 },
      { courseCode: "CS401", courseName: "Software Engineering", rank: 3, points: 445, totalStudents: 58 },
    ]
  );

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setIsBadgeModalOpen(true);
  };

  const handleRankClick = () => {
    router.push("/lighthouse/leaderboard");
  };

  const handleBadgesClick = () => {
    const badgesSection = document.getElementById("badges-section");
    if (badgesSection) {
      badgesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePointsClick = () => {
    setIsPointsModalOpen(true);
  };

  return (
    <>
      <SetHeaderClientComponent title={"LIGHTHOUSE"} />
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-lucerayellow-1 text-lucerayellow-5 px-8 py-4 rounded-lg shadow-md border border-lucerayellow-2">
              <Trophy className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Lighthouse</h1>
                <p className="text-sm opacity-80">Earn Points. Get Badges!</p>
              </div>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total Points"
              value={currentPoints.toLocaleString()}
              icon={Star}
              color="yellow"
              clickable={true}
              onClick={handlePointsClick}
            />
            <StatsCard
              title="University Rank"
              value={`#${currentRank}`}
              icon={Trophy}
              color="blue"
              subtitle={`of ${totalStudents.toLocaleString()} students`}
              clickable={true}
              onClick={handleRankClick}
            />
            <StatsCard
              title="Badges Earned"
              value={`${collectedBadges.filter((b) => b.collected).length}/${collectedBadges.length}`}
              icon={Users}
              color="purple"
              clickable={true}
              onClick={handleBadgesClick}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Course Rankings */}
            <CourseRankCard courseRanks={courseRanks} />
            
            {/* Action Buttons */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
              <ActionButton
                href="/lighthouse/minigames"
                icon={GamepadIcon}
                title="Play Minigames"
                description="Earn points through games"
                color="rose"
              />
              <ActionButton
                href="/lighthouse/leaderboard"
                icon={BarChart3}
                title="View Leaderboards"
                description="See how you compare"
                color="blue"
              />
            </div>
          </div>

          {/* Badges Collection */}
          <BadgeGrid badges={collectedBadges} onBadgeClick={handleBadgeClick} />
        </div>
      </main>

      {/* Modals */}
      <BadgeDetailModal
        badge={selectedBadge}
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
      />
      <PointsInfoModal
        isOpen={isPointsModalOpen}
        onClose={() => setIsPointsModalOpen(false)}
      />
    </>
  );
}
