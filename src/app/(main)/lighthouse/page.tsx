import React from "react";
import { auth } from "../../../lib/auth";
import { getUserData } from "@/lib/database-service/auth";
import { redirect } from "next/navigation";
import LighthouseHome from "@/components/feature/lighthouse/lighthouse-home";

export default async function LighthousePage() {
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
    <LighthouseHome
      isTeacher={isTeacher}
      userData={userData}
      session={session}
    />
  );
}


