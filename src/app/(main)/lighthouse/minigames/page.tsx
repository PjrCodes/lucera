import React from "react";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { redirect } from "next/navigation";
import MinigamesHome from "@/components/feature/lighthouse/minigames-home";

export default async function MinigamesPage() {
  const { session, userData } = await getSessionAndUserData();

  const isTeacher = userData.role === "teacher";

  // Redirect teachers away from minigames
  if (isTeacher) {
    redirect("/lighthouse");
  }

  return <MinigamesHome userData={userData} session={session} />;
}
