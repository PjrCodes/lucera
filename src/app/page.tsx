import { auth } from "../auth";
import Bookmarks from "@/components/Bookmarks";
import Create from "@/components/Create";
import StudentAlerts from "@/components/StudentAlerts";
import Courses from "@/components/Courses";
import UpcomingDeadlines from "@/components/UpcomingDeadlines";

export default async function Home() {
  const session = await auth();

  const isLoggedIn = session?.user ? true : false;

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
          {/* Upcoming Deadlines */}
          <UpcomingDeadlines />
          {/* Progress */}
          <Courses />
          {/* Student Alerts */}
          <StudentAlerts />
        </div>
        {/* Right Column */}
        <div className="flex flex-col flex-3 min-w-[100px] gap-4">
          <Bookmarks />
          <Create />
        </div>
      </div>
    </main>
  );
}
