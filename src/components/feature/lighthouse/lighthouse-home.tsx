"use client";
import React, { useState } from "react";
import { Trophy, Users, Filter, BarChart3, Activity, Grid } from "lucide-react";
import { Session } from "next-auth";
import StatsCard from "@/components/feature/lighthouse/stats-card";
import BadgeGrid from "@/components/feature/lighthouse/badge-grid";
import BadgeDetailModal from "@/components/feature/lighthouse/badge-detail-modal";
import LeaderboardComponent from "@/components/feature/lighthouse/leaderboard-component";
import SetHeaderClientComponent from "@/components/feature/header/set-header-client-component";
import { UserData } from "@/lib/schemas/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart } from "recharts";

interface Badge {
  id: number;
  name: string;
  emoji: string;
  collected: boolean;
  description?: string;
  unlockedTime?: string; // When the badge was unlocked
}

interface Course {
  code: string;
  name: string;
}

interface LighthouseHomeProps {
  isTeacher: boolean;
  userData: UserData;
  session: Session;
}

export default function LighthouseHome({ isTeacher }: LighthouseHomeProps) {
  const [currentRank] = useState(15);
  const [totalStudents] = useState(1250);
  const [selectedTimelineCourse, setSelectedTimelineCourse] = useState<string>("university"); // Timeline filter

  // Modal states
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  const [collectedBadges] = useState<Badge[]>([
    {
      id: 1,
      name: "First Steps",
      emoji: "👶",
      collected: true,
      description: "Completed first course",
      unlockedTime: "2 weeks ago",
    },
    {
      id: 2,
      name: "Speed Demon",
      emoji: "⚡",
      collected: true,
      description: "Fast assignment completion",
      unlockedTime: "1 week ago",
    },
    {
      id: 3,
      name: "Scholar",
      emoji: "🎓",
      collected: true,
      description: "High academic performance",
      unlockedTime: "3 days ago",
    },
    {
      id: 4,
      name: "Night Owl",
      emoji: "🦉",
      collected: false
    },
    {
      id: 5,
      name: "Perfectionist",
      emoji: "💎",
      collected: false
    },
    {
      id: 6,
      name: "Team Player",
      emoji: "🤝",
      collected: false
    },
    {
      id: 7,
      name: "Mastermind",
      emoji: "🧠",
      collected: true,
      description: "Problem solving expert",
      unlockedTime: "1 day ago",
    },
    {
      id: 8,
      name: "Explorer",
      emoji: "🗺️",
      collected: false
    },
  ]);

  const courses: Course[] = [
    { code: "CS101", name: "Introduction to Programming" },
    { code: "CS201", name: "Data Structures" },
    { code: "CS301", name: "Algorithms" },
    { code: "CS401", name: "Software Engineering" },
  ];

  // Chart data for teachers
  const badgeDistributionData = [
    { badges: "0", students: 45, fill: "var(--color-chart-1)" },
    { badges: "1", students: 78, fill: "var(--color-chart-2)" },
    { badges: "2", students: 112, fill: "var(--color-chart-3)" },
    { badges: "3", students: 89, fill: "var(--color-chart-4)" },
    { badges: "4", students: 67, fill: "var(--color-chart-5)" },
    { badges: "5", students: 34, fill: "var(--color-chart-1)" },
    { badges: "6", students: 23, fill: "var(--color-chart-2)" },
    { badges: "7", students: 15, fill: "var(--color-chart-3)" },
    { badges: "8", students: 8, fill: "var(--color-chart-4)" },
  ];

  // Cumulative badge unlock timeline data - per course
  const timelineData = {
    university: [
      { week: "Week 1", cumulative: 12 },
      { week: "Week 2", cumulative: 34 },
      { week: "Week 3", cumulative: 67 },
      { week: "Week 4", cumulative: 105 },
      { week: "Week 5", cumulative: 156 },
      { week: "Week 6", cumulative: 201 },
      { week: "Week 7", cumulative: 245 },
      { week: "Week 8", cumulative: 289 },
      { week: "Week 9", cumulative: 324 },
      { week: "Week 10", cumulative: 356 },
      { week: "Week 11", cumulative: 381 },
      { week: "Week 12", cumulative: 402 },
    ],
    CS101: [
      { week: "Week 1", cumulative: 5 },
      { week: "Week 2", cumulative: 12 },
      { week: "Week 3", cumulative: 23 },
      { week: "Week 4", cumulative: 34 },
      { week: "Week 5", cumulative: 47 },
      { week: "Week 6", cumulative: 58 },
      { week: "Week 7", cumulative: 65 },
      { week: "Week 8", cumulative: 71 },
    ],
    CS201: [
      { week: "Week 1", cumulative: 3 },
      { week: "Week 2", cumulative: 8 },
      { week: "Week 3", cumulative: 16 },
      { week: "Week 4", cumulative: 25 },
      { week: "Week 5", cumulative: 32 },
      { week: "Week 6", cumulative: 38 },
      { week: "Week 7", cumulative: 43 },
      { week: "Week 8", cumulative: 47 },
    ],
    CS301: [
      { week: "Week 1", cumulative: 2 },
      { week: "Week 2", cumulative: 7 },
      { week: "Week 3", cumulative: 15 },
      { week: "Week 4", cumulative: 24 },
      { week: "Week 5", cumulative: 31 },
      { week: "Week 6", cumulative: 37 },
      { week: "Week 7", cumulative: 42 },
      { week: "Week 8", cumulative: 46 },
    ],
    CS401: [
      { week: "Week 1", cumulative: 4 },
      { week: "Week 2", cumulative: 11 },
      { week: "Week 3", cumulative: 19 },
      { week: "Week 4", cumulative: 28 },
      { week: "Week 5", cumulative: 36 },
      { week: "Week 6", cumulative: 42 },
      { week: "Week 7", cumulative: 47 },
      { week: "Week 8", cumulative: 51 },
    ],
  };

  const getCurrentTimelineData = () => {
    return timelineData[selectedTimelineCourse as keyof typeof timelineData] || timelineData.university;
  };

  // Per-badge unlock heatmap data (simplified for display)
  const badgeHeatmapData = [
    { badge: "First Steps", week1: 25, week2: 18, week3: 12, week4: 8, total: 63 },
    { badge: "Speed Demon", week1: 5, week2: 15, week3: 22, week4: 18, total: 60 },
    { badge: "Scholar", week1: 3, week2: 8, week3: 18, week4: 25, total: 54 },
    { badge: "Night Owl", week1: 12, week2: 14, week3: 10, week4: 6, total: 42 },
    { badge: "Perfectionist", week1: 2, week2: 5, week3: 12, week4: 20, total: 39 },
    { badge: "Team Player", week1: 8, week2: 12, week3: 15, week4: 10, total: 45 },
    { badge: "Mastermind", week1: 1, week2: 3, week3: 8, week4: 15, total: 27 },
    { badge: "Explorer", week1: 6, week2: 9, week3: 11, week4: 8, total: 34 },
  ];

  const chartConfig = {
    students: {
      label: "Students",
      color: "var(--color-chart-1)",
    },
    cumulative: {
      label: "Cumulative Unlocks",
      color: "var(--color-chart-2)",
    },
    total: {
      label: "Total Unlocks",
      color: "var(--color-chart-3)",
    },
    week1: {
      label: "Week 1",
      color: "var(--color-chart-1)",
    },
    week2: {
      label: "Week 2",
      color: "var(--color-chart-2)",
    },
    week3: {
      label: "Week 3",
      color: "var(--color-chart-3)",
    },
    week4: {
      label: "Week 4",
      color: "var(--color-chart-4)",
    },
  };

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setIsBadgeModalOpen(true);
  };

  const handleBadgesClick = () => {
    const badgesSection = document.getElementById("badges-section");
    if (badgesSection) {
      badgesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLeaderboardClick = () => {
    const leaderboardSection = document.getElementById("leaderboard-section");
    if (leaderboardSection) {
      leaderboardSection.scrollIntoView({ behavior: "smooth" });
    }
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
                  {isTeacher
                    ? "Monitor student badge achievements and analytics"
                    : "Collect Badges & Climb the Leaderboard!"}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Dashboard - Only for Students */}
          {!isTeacher && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <StatsCard
                title="University Rank"
                value={`#${currentRank}`}
                icon={Trophy}
                color="secondary"
                subtitle={`of ${totalStudents.toLocaleString()} students`}
                clickable={true}
                onClick={handleLeaderboardClick}
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

          {/* Teacher Charts Section */}
          {isTeacher && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {/* Badge Distribution Histogram */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Badge Distribution
                  </CardTitle>
                  <CardDescription>Number of students by badge count (Engagement levels)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart accessibilityLayer data={badgeDistributionData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="badges"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        label={{ value: 'Number of Badges', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Students', angle: -90, position: 'insideLeft' }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="students" fill="var(--color-students)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Badge Unlock Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Badge Unlock Timeline
                  </CardTitle>
                  <CardDescription>
                    Cumulative badge unlocks over time
                    <div className="flex items-center gap-2 mt-2">
                      <Filter className="w-3 h-3" />
                      <select
                        value={selectedTimelineCourse}
                        onChange={(e) => setSelectedTimelineCourse(e.target.value)}
                        className="text-xs px-2 py-1 border rounded"
                      >
                        <option value="university">All Courses</option>
                        {courses.map((course) => (
                          <option key={course.code} value={course.code}>
                            {course.code}
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <AreaChart accessibilityLayer data={getCurrentTimelineData()}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="week"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Cumulative Unlocks', angle: -90, position: 'insideLeft' }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        dataKey="cumulative"
                        type="monotone"
                        fill="var(--color-cumulative)"
                        stroke="var(--color-cumulative)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Per-Badge Unlock Heatmap */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Grid className="w-5 h-5" />
                    Badge Difficulty Analysis
                  </CardTitle>
                  <CardDescription>Total unlocks per badge (difficulty indicator)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart accessibilityLayer data={badgeHeatmapData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="badge"
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={11}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'Total Unlocks', angle: -90, position: 'insideLeft' }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Leaderboard Section */}
          <div id="leaderboard-section" className="mb-8">
            <LeaderboardComponent isTeacher={isTeacher} />
          </div>

          {/* Badges Collection - Only for Students */}
          {!isTeacher && (
            <BadgeGrid
              badges={collectedBadges}
              onBadgeClick={handleBadgeClick}
            />
          )}
        </div>
      </main>

      {/* Modals - Only for Students */}
      {!isTeacher && (
        <BadgeDetailModal
          badge={selectedBadge}
          isOpen={isBadgeModalOpen}
          onClose={() => setIsBadgeModalOpen(false)}
        />
      )}
    </>
  );
}
