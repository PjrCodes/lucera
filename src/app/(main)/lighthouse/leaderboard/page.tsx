import React from "react";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import LeaderboardHome from "@/components/feature/lighthouse/leaderboard-home";

export default async function LeaderboardPage() {
  const { session, userData } = await getSessionAndUserData();

  const isTeacher = userData.role === "teacher";

  return (
    <LeaderboardHome
      isTeacher={isTeacher}
      userData={userData}
      session={session}
    />
  );
}
