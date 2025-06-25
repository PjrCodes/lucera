import React from "react";
import { auth } from "../../../../lib/auth";
import { getUserData } from "@/lib/database-service/auth";
import { redirect } from "next/navigation";
import LeaderboardHome from "@/components/feature/lighthouse/leaderboard-home";

export default async function LeaderboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  let userData;
  try {
    userData = await getUserData(session?.user?.id || "");
  } catch {
    redirect("/handle-invalid-user");
  }

  const isTeacher = userData.role === "teacher";

  return (
    <LeaderboardHome
      isTeacher={isTeacher}
      userData={userData}
      session={session}
    />
  );
}
