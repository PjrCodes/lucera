import { auth } from "@/lib/auth";
import { getUserData } from "@/lib/database-service/auth";
import AuthDashboard from "@/components/feature/dashboard/auth-dashboard";
import { redirect } from "next/navigation";
import { UserData } from "@/lib/schemas/database";

export default async function Home() {
  const session = await auth();

  if (!session || !session.user) {
    // If the session is not valid, redirect to the landing page
    redirect("/landing");
  }

  let userData: UserData | null = null;
  try {
    userData = await getUserData(session.user.id || "");
    return <AuthDashboard userData={userData} session={session} />;
  } catch {
    redirect("/handle-invalid-user");
  }
}
