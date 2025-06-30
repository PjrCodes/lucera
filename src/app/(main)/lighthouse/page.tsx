import React from "react";
import LighthouseHome from "@/components/feature/lighthouse/lighthouse-home";
import { getSessionAndUserData } from "@/lib/database-service/auth";

export default async function LighthousePage() {
  const { session, userData } = await getSessionAndUserData();

  const isTeacher = userData.role === "teacher";

  return (
    <LighthouseHome
      isTeacher={isTeacher}
      userData={userData}
      session={session}
    />
  );
}
