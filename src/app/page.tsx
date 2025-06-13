import { auth } from "../auth";
import {
  checkTeacherhood,
  getUserData,
} from "@/lib/database/auth";
import {
  setDefaultDashboardLayout,
} from "@/lib/database/dashboard";
import UnauthHomepage from "@/components/unauth-homepage";
import AuthDashboard from "@/components/auth-dashboard";

export default async function Home() {
  const session = await auth();

  const isLoggedIn = session?.user ? true : false;

  if (!isLoggedIn) {
    return <UnauthHomepage />;
  }

  // userRole
  const isTeacher = await checkTeacherhood(session?.user?.id || "");
  const userData = await getUserData(session?.user?.id || "");
  const dashboardLayout = userData?.dashboardLayout;

  if (!dashboardLayout) {
    await setDefaultDashboardLayout(session?.user?.id || "", isTeacher);
  }

  return (
    <AuthDashboard
      isTeacher={isTeacher}
      dashboardLayout={dashboardLayout}
      session={session}
    />
  );
}
