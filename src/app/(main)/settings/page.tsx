import React from "react";
import { redirect } from "next/navigation";
import SettingsClientComponent from "@/components/feature/profile/settings-client";
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
  return <SettingsClientComponent userData={userData} />;
}
