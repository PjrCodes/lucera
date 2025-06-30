import MessagesClientComponent from "@/components/feature/messages/messages-client-component";
import { getUserData, serverComponentRedirectUnauthenticated } from "@/lib/database-service/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function MessagesPage() {
   const session = await serverComponentRedirectUnauthenticated();
    let userData;
    try {
      userData = await getUserData(session.user.id);
    } catch {
      redirect("/handle-invalid-user");
    }
    
    return <MessagesClientComponent session={session} userData={userData} />;
}
