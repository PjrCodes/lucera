import React from "react";
import SettingsForm from "@/components/feature/profile/settings-form";
import { getSessionAndUserData } from "@/lib/database-service/auth";

export default async function SettingsPage() {
  const { userData } = await getSessionAndUserData();
  return <SettingsForm userData={userData} />;
}
