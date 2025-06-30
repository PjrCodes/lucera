import React from "react";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/feature/profile/settings-form";
import {
  getUserData,
  serverComponentRedirectUnauthenticated,
} from "@/lib/database-service/auth";

export default async function SettingsPage() {
  const session = await serverComponentRedirectUnauthenticated();
  let userData;
  try {
    userData = await getUserData(session.user.id);
  } catch {
    redirect("/handle-invalid-user");
  }
  return <SettingsForm userData={userData} />;
}
