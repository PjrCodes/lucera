import { auth } from "../../auth";
import {
  getUserData,
} from "@/lib/database/auth";
import {
  setDefaultDashboardLayout,
} from "@/lib/database/dashboard";
import UnauthHomepage from "@/components/unauth-homepage";
import AuthDashboard from "@/components/auth-dashboard";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  const isLoggedIn = session?.user ? true : false;

  if (!isLoggedIn) {
    return <UnauthHomepage />;
  }

  let isTeacher = false;
  let dashboardLayout;
  try {
    const userData = await getUserData(session?.user?.id || "");
    isTeacher = userData.role === "teacher";
    dashboardLayout = userData?.dashboardLayout;
  } catch {
    redirect("/handle-invalid-user");
  }

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
