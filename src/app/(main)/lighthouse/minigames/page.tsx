import React from "react";
import { auth } from "../../../../lib/auth";
import { getUserData } from "@/lib/database/auth";
import { redirect } from "next/navigation";
import MinigamesHome from "@/components/feature/lighthouse/minigames-home";

export default async function MinigamesPage() {
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

  // Redirect teachers away from minigames
  if (isTeacher) {
    redirect("/lighthouse?error=teacher-access-denied");
  }

  return (
    <MinigamesHome
      userData={userData}
      session={session}
    />
  );
}
