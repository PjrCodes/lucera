import { auth } from "../auth";
import { checkTeacherhood, getUserData } from "@/lib/databaseService";
import UnauthHomepage from "@/components/unauthHomepage";
import AuthDashboard from "@/components/authDashboard";

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
  
  return (
    <AuthDashboard isTeacher={isTeacher} dashboardLayout={dashboardLayout} session={session} />
  );
}
