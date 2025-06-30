import React from "react";
import {
  getUserData,
  serverComponentRedirectUnauthenticated,
} from "@/lib/database-service/auth";
import { redirect } from "next/navigation";
import LighthouseHome from "@/components/feature/lighthouse/lighthouse-home";

export default async function LighthousePage() {
  const session = await serverComponentRedirectUnauthenticated();
  let userData;
  try {
    userData = await getUserData(session.user.id);
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
