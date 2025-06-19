import { auth } from "../../lib/auth";
import {
  getUserData,
} from "@/lib/database/auth";
import {
  setDefaultDashboardLayout,
} from "@/lib/database/dashboard";
import UnauthHomepage from "@/components/feature/dashboard/unauth-homepage";
import AuthDashboard from "@/components/feature/dashboard/auth-dashboard";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session || !session.user) {
    // If the session is not valid, redirect to the homepage
    redirect("/");
  }

  // let isTeacher = false;
  // let dashboardLayout;
  let userData;
  try {
    userData = await getUserData(session?.user?.id || "");
    // isTeacher = userData.role === "teacher";
    // dashboardLayout = userData?.dashboardLayout;

    // if (!dashboardLayout) {
    //   await setDefaultDashboardLayout(session?.user?.id || "", isTeacher);
    // }
  } catch {
    redirect("/handle-invalid-user");
  }

  return (
    <AuthDashboard
      userData={userData}
      session={session}
    />
  );
}
