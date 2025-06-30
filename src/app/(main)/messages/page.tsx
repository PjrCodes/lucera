import MessagesClientComponent from "@/components/feature/messages/messages-client-component";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import React from "react";

export default async function MessagesPage() {
  const { session, userData } = await getSessionAndUserData();

  return <MessagesClientComponent session={session} userData={userData} />;
}
