import { JSX } from "react";
import { NextPage } from "next";
import { Session } from "next-auth";
import UpcomingDeadlines from "./cards/upcoming-deadlines";
import Courses from "./cards/courses";
import StudentAlerts from "./cards/student-alerts";
import Bookmarks from "./cards/bookmarks";
import Create from "./cards/create";
import RecentlyAccessed from "./cards/recently-accessed";
import Announcements from "./cards/announcements";
import defaults from "@/appdata/defaults.json";
import dashboardControlList from "@/appdata/acl/dashboard.json";
import { MdBrokenImage } from "react-icons/md";
import { UserData } from "@/lib/schemas/database";
import { PropsForEveryDashboardCard } from "@/lib/interfaces/props";
import YourBadges from "./cards/your-badges";
import WhatsNext from "./cards/whats-next";

interface Props {
  session: Session
  userData: UserData
}

// Component map to hold the components for the dashboard
const componentMap: Record<string, (props: PropsForEveryDashboardCard) => JSX.Element> = {
  PROGRESS: (props) => (
    <Courses
      key="progress"
      session={props.session}
      userData={props.userData}
    />
  ),
  WHATS_NEXT: (props) => (
    <WhatsNext
      key="whats-next"
      session={props.session}
      userData={props.userData}
    />
  ),
  CLASS_PROGRESS: (props) => (
    <Courses
      key="class-progress"
      session={props.session}
      userData={props.userData}
    />
  ),
  STUDENT_ALERTS: (props) => (
    <StudentAlerts
      key="student-alerts"
      session={props.session}
      userData={props.userData}
    />
  ),
  RECENTLY_ACCESSED: (props) => (
    <RecentlyAccessed
      key="recently-accessed"
      session={props.session}
      userData={props.userData}
    />
  ),
  UPCOMING_DEADLINES: (props) => (
    <UpcomingDeadlines
      key="upcoming-deadlines"
      session={props.session}
      userData={props.userData}
    />
  ),
  ANNOUNCEMENTS: (props) => (
    <Announcements
      key="announcements"
      session={props.session}
      userData={props.userData}
    />
  ),
  BOOKMARKS: (props) => (
    <Bookmarks
      key="bookmarks"
      session={props.session}
      userData={props.userData}
    />
  ),
  YOUR_BADGES: (props) => (
    <YourBadges
      key="your-badges"
      session={props.session}
      userData={props.userData}
    />
  ),
  CREATE: (props) => (
    <Create key="create" session={props.session} userData={props.userData} />
  ),
};

function checkAndCleanLayout(
  layout: { leftColumn: string[]; rightColumn: string[] },
  isTeacher: boolean
) {
  const errors: string[] = [];

  const roleRestrictions =
    dashboardControlList.role_restrictions[isTeacher ? "teacher" : "student"];
  const columnRestrictions = dashboardControlList.column_restrictions;

  // Helper to filter and collect errors
  function filterColumn(
    column: string[],
    columnName: "leftColumn" | "rightColumn"
  ) {
    return column.filter((component) => {
      if (!roleRestrictions.includes(component)) {
        errors.push(
          `Component "${component}" is not allowed for ${
            isTeacher ? "teacher" : "student"
          }`
        );
        return false;
      }
      if (!columnRestrictions[columnName].includes(component)) {
        errors.push(`Component "${component}" is not allowed in ${columnName}`);
        return false;
      }
      return true;
    });
  }

  const cleanedLayout = {
    leftColumn: filterColumn(layout.leftColumn, "leftColumn"),
    rightColumn: filterColumn(layout.rightColumn, "rightColumn"),
  };

  return {
    layout: cleanedLayout,
    errors,
  };
}

const AuthDashboard: NextPage<Props> = ({
  session,
  userData,
}) => {
  // Props object for component rendering - only session and role data
  const componentProps: PropsForEveryDashboardCard = {
    session,
    userData,
  };

  // Function to render components based on layout array
  const renderComponents = (layoutArray: string[]) => {
    return (
      layoutArray
        ?.map((componentKey) => {
          const ComponentFunction = componentMap[componentKey];
          return ComponentFunction ? ComponentFunction(componentProps) : null;
        })
        .filter(Boolean) || []
    );
  };

  const dashboardLayout = userData.dashboardLayout;
  const isTeacher = userData.role === "teacher";

  // get default layour for user type from data/defaults.json
  const uncleanLayout =
    dashboardLayout ||
    defaults.dashboardLayout[isTeacher ? "teacher" : "student"];

  // layout ACL checking
  const { layout: currentLayout, errors } = checkAndCleanLayout(
    uncleanLayout,
    isTeacher
  );

  if (
    currentLayout.leftColumn.length === 0 &&
    currentLayout.rightColumn.length === 0
  ) {
    return (
      <main className="w-full h-full px-4 py-4 bg-transparent">
        <div className="w-full h-full flex flex-1 flex-col justify-center text-center text-gray-500">
          <div className="font-header text-6xl font-bold text-primary-800 mb-4">
            Hi, {session?.user?.name || "there"}! Start by adding items to your dashboard.
          </div>
          <MdBrokenImage size={48} className="mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No Components Found</h2>
          You have no components in your dashboard! Please use the edit button
          to add some!
          <br></br>
          You can also choose to reset your dashboard to the default layout.
        </div>
      </main>
    );
  }

  return (
    <main className="w-full flex flex-col px-4 py-4 flex-1 bg-transparent">
      {errors.length > 0 ? (
        <div>
          <h2 className="text-red-600 font-bold">Dashboard Layout Errors:</h2>
          <ul className="list-disc pl-5">
            {errors.map((error, index) => (
              <li key={index} className="text-red-500">
                {error}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="flex flex-wrap w-full gap-4 flex-1">
        {/* Left Column - takes more space on large screens, full width on small */}
        <div
          className={
            "flex flex-col flex-1 min-w-[300px] gap-4" +
            (currentLayout.rightColumn.length > 0
              ? "  basis-[60%]"
              : " basis-full")
          }
        >
          <div className="font-header text-2xl md:text-5xl font-bold text-secondary-600 mb-4">
            Hi, {session?.user?.name || "there"}!<br></br>Welcome to your dashboard.
          </div>
          {renderComponents(currentLayout.leftColumn)}
        </div>
        {/* Right Column - takes less space on large screens, full width on small */}
        <div
          className={
            "flex flex-col flex-1 min-w-[250px] gap-4 " +
            (currentLayout.leftColumn.length > 0
              ? " basis-[30%]"
              : " basis-full")
          }
        >
          {renderComponents(currentLayout.rightColumn)}
        </div>
      </div>
    </main>
  );
};

export default AuthDashboard;
