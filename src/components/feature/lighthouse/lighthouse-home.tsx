"use client";
import React, { useState } from "react";
import { Trophy, Star, Users, GamepadIcon, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import StatsCard from "@/components/feature/lighthouse/stats-card";
import BadgeGrid from "@/components/feature/lighthouse/badge-grid";
import CourseRankCard from "@/components/feature/lighthouse/course-rank-card";
import ActionButton from "@/components/feature/lighthouse/action-buttons";
import BadgeDetailModal from "@/components/feature/lighthouse/badge-detail-modal";
import PointsInfoModal from "@/components/feature/lighthouse/points-info-modal";
import SetHeaderClientComponent from "@/components/feature/header/set-header-client-component";
import { UserData } from "@/lib/schemas/database";

interface Badge {
  id: number;
  name: string;
  emoji: string;
  collected: boolean;
  description?: string;
}

interface LighthouseHomeProps {
  isTeacher: boolean;
  userData: UserData;
  session: Session;
}

export default function LighthouseHome({ isTeacher }: LighthouseHomeProps) {
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
      <main className="min-h-screen bg-primary-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-primary-100 text-primary-800 px-8 py-4 rounded-lg shadow-md border border-primary-200">
              <Trophy className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Lighthouse</h1>
                <p className="text-sm opacity-80">
                  {isTeacher ? "View Student Performance" : "Earn Points. Get Badges!"}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Dashboard - Only for Students */}
          {!isTeacher && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Total Points"
                value={currentPoints.toLocaleString()}
                icon={Star}
                color="primary"
                clickable={true}
                onClick={handlePointsClick}
              />
              <StatsCard
                title="University Rank"
                value={`#${currentRank}`}
                icon={Trophy}
                color="secondary"
                subtitle={`of ${totalStudents.toLocaleString()} students`}
                clickable={true}
                onClick={handleRankClick}
              />
              <StatsCard
                title="Badges Earned"
                value={`${collectedBadges.filter((b) => b.collected).length}/${collectedBadges.length}`}
                icon={Users}
                color="primary"
                clickable={true}
                onClick={handleBadgesClick}
              />
            </div>
          )}

          {/* Teacher Dashboard */}
          {isTeacher && (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-secondary-800 mb-4">Teacher Dashboard</h2>
                <p className="text-gray-600 mb-4">
                  View student performance and leaderboards across your courses and the university.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-secondary-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-secondary-800 mb-2">Course Analytics</h3>
                    <p className="text-sm text-secondary-600">View detailed performance metrics for students in your courses</p>
                  </div>
                  <div className="bg-primary-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-primary-800 mb-2">Leaderboard Overview</h3>
                    <p className="text-sm text-primary-600">Monitor student rankings and engagement levels</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Student Layout with Course Rankings */}
          {!isTeacher && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Course Rankings */}
              <CourseRankCard courseRanks={courseRanks} />

              {/* Action Buttons */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-secondary-800 mb-4">Quick Actions</h2>

                <ActionButton
                  href="/lighthouse/minigames"
                  icon={GamepadIcon}
                  title="Play Minigames"
                  description="Earn points through games"
                  color="primary"
                />

                <ActionButton
                  href="/lighthouse/leaderboard"
                  icon={BarChart3}
                  title="View Leaderboards"
                  description="See how you compare"
                  color="secondary"
                />
              </div>
            </div>
          )}

          {/* Teacher Layout - Only Action Buttons */}
          {isTeacher && (
            <div className="max-w-md mx-auto mb-8">
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-secondary-800 mb-4 text-center">Quick Actions</h2>

                <ActionButton
                  href="/lighthouse/leaderboard"
                  icon={BarChart3}
                  title="View Leaderboards"
                  description="Monitor student rankings"
                  color="secondary"
                />
              </div>
            </div>
          )}

          {/* Badges Collection - Only for Students */}
          {!isTeacher && (
            <BadgeGrid badges={collectedBadges} onBadgeClick={handleBadgeClick} />
          )}
        </div>
      </main>

      {/* Modals - Only for Students */}
      {!isTeacher && (
        <>
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
      )}
    </>
  );
}
