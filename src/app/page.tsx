import { auth } from "../auth";
import Bookmarks from "@/components/bookmarks";
import Create from "@/components/create";
import StudentAlerts from "@/components/studentAlerts";
import Courses from "@/components/courses";
import UpcomingDeadlines from "@/components/upcomingDeadlines";
import { checkTeacherhood, getUserData } from "@/lib/databaseService";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  const isLoggedIn = session?.user ? true : false;

  if (!session?.user?.id) {
    redirect("/"); // Redirect to home if no user ID is found
  }
  // userRole
  const isTeacher = await checkTeacherhood(session?.user?.id);
  const userData = await getUserData(session?.user?.id);
  const dashboardLayout = userData?.dashboardLayout;

  // Component mapping
  const componentMap = {
    WHATS_NEXT: <UpcomingDeadlines key="whats-next" />,
    PROGRESS: <Courses key="progress" isTeacher={isTeacher} user={session?.user} />,
    YOUR_BADGES: <StudentAlerts key="your-badges" />,
    BOOKMARKS: <Bookmarks key="bookmarks" />,
    UPCOMING_DEADLINES: <UpcomingDeadlines key="upcoming-deadlines" />,
    CREATE: <Create key="create" />
  };

  // Function to render components based on layout array
  const renderComponents = (layoutArray: string[]) => {
    return layoutArray?.map(componentKey => componentMap[componentKey as keyof typeof componentMap]).filter(Boolean) || [];
  };

  // Default layout if no dashboardLayout is found
  const defaultLayout = {
    leftColumn: ["UPCOMING_DEADLINES", "PROGRESS", "YOUR_BADGES"],
    rightColumn: ["BOOKMARKS", "CREATE"]
  };

  const currentLayout = dashboardLayout || defaultLayout;

  if (!isLoggedIn) {
    return (
      <main className="w-full flex flex-col space-y-2 items-center justify-center flex-1">
        <p>You are not logged in. Please sign in to continue.</p>
      </main>
    );
  }
  
  return (
    <main className="w-full flex flex-col px-4 py-4 flex-1">
      <div className="flex flex-row w-full gap-4 flex-1">
        {/* Left Column */}
        <div className="flex flex-col flex-7 gap-4">
          {renderComponents(currentLayout.leftColumn)}
        </div>
        {/* Right Column */}
        <div className="flex flex-col flex-3 min-w-[100px] gap-4">
          {renderComponents(currentLayout.rightColumn)}
        </div>
      </div>
    </main>
  );
}
