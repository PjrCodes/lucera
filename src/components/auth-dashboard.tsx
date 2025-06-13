import { JSX } from "react";
import { NextPage } from "next";
import { Session } from "next-auth";
import UpcomingDeadlines from "./dashboard/upcoming-deadlines";
import Courses from "./dashboard/courses";
import StudentAlerts from "./dashboard/student-alerts";
import Bookmarks from "./dashboard/bookmarks";
import Create from "./dashboard/create";
import defaults from "@/appdata/defaults.json";
import dashboardControlList from "@/appdata/acl/dashboard.json";
import { MdBrokenImage } from "react-icons/md";

interface Props {
  session: Session | null;
  isTeacher: boolean;
  dashboardLayout: {
    leftColumn: string[];
    rightColumn: string[];
  } | null;
  onLayoutChange?: () => void; // Add callback for layout changes
}

interface ComponentProps {
  session: Session | null;
  isTeacher: boolean;
}

// Component map to hold the components for the dashboard
const componentMap: Record<string, (props: ComponentProps) => JSX.Element> = {
  PROGRESS: (props) => (
    <Courses
      key="progress"
      session={props.session}
      isTeacher={props.isTeacher}
    />
  ),
  WHATS_NEXT: (props) => (
    <UpcomingDeadlines
      key="whats-next"
      session={props.session}
      isTeacher={props.isTeacher}
    />
  ),
  CLASS_PROGRESS: (props) => (
    <Courses
      key="class-progress"
      session={props.session}
      isTeacher={props.isTeacher}
    />
  ),
  STUDENT_ALERTS: (props) => (
    <StudentAlerts
      key="student-alerts"
      session={props.session}
      isTeacher={props.isTeacher}
    />
  ),
  RECENTLY_ACCESSED: (props) => (
    <Courses
      key="recently-accessed"
      session={props.session}
      isTeacher={props.isTeacher}
    />
  ),
  UPCOMING_DEADLINES: (props) => (
    <UpcomingDeadlines
      key="upcoming-deadlines"
      session={props.session}
      isTeacher={props.isTeacher}
    />
  ),
  ANNOUNCEMENTS: (props) => (
    <StudentAlerts
      key="announcements"
      session={props.session}
      isTeacher={props.isTeacher}
    />
  ),
  BOOKMARKS: (props) => (
    <Bookmarks
      key="bookmarks"
      session={props.session}
      isTeacher={props.isTeacher}
    />
  ),
  YOUR_BADGES: (props) => (
    <StudentAlerts
      key="your-badges"
      session={props.session}
      isTeacher={props.isTeacher}
    />
  ),
  CREATE: (props) => (
    <Create key="create" session={props.session} isTeacher={props.isTeacher} />
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
  isTeacher,
  dashboardLayout,
  onLayoutChange,
}) => {
  // Props object for component rendering - only session and role data
  const componentProps: ComponentProps = {
    session,
    isTeacher,
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
