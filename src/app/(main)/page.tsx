import {
  getSessionAndUserData,
} from "@/lib/database-service/auth";
import AuthDashboard from "@/components/feature/dashboard/auth-dashboard";

export default async function Home() {
  const { session, userData } = await getSessionAndUserData();
  return <AuthDashboard userData={userData} session={session} />;
}
