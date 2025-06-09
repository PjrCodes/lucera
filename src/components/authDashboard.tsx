import { JSX } from "react";
import { NextPage } from "next";
import { Session } from "next-auth";
import UpcomingDeadlines from "./dashboard/upcomingDeadlines";
import Courses from "./dashboard/courses";
import StudentAlerts from "./dashboard/studentAlerts";
import Bookmarks from "./dashboard/bookmarks";
import Create from "./dashboard/create";
import defaults from "../../data/defaults.json";
import dashboardControlList from "../../data/acl/dashboard.json";

interface Props {
  session: Session | null;
  isTeacher: boolean;
  dashboardLayout: {
    leftColumn: string[];
    rightColumn: string[];
  } | null;
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
    <UpcomingDeadlines key="whats-next" session={props.session} isTeacher={props.isTeacher} />
  ),
  CLASS_PROGRESS: (props) => (
    <Courses
      key="class-progress"
      session={props.session}
      isTeacher={props.isTeacher}
    />
  ),
  STUDENT_ALERTS: (props) => (
    <StudentAlerts key="student-alerts" session={props.session} isTeacher={props.isTeacher} />
  ),
  RECENTLY_ACCESSED: (props) => (
    <Courses
      key="recently-accessed"
      session={props.session}
      isTeacher={props.isTeacher}
    />
  ),
  UPCOMING_DEADLINES: (props) => (
    <UpcomingDeadlines key="upcoming-deadlines" session={props.session} isTeacher={props.isTeacher} />
  ),
  ANNOUNCEMENTS: (props) => (
    <StudentAlerts key="announcements" session={props.session} isTeacher={props.isTeacher} />
  ),
  BOOKMARKS: (props) => (
    <Bookmarks key="bookmarks" session={props.session} isTeacher={props.isTeacher} />
  ),
  YOUR_BADGES: (props) => (
    <StudentAlerts key="your-badges" session={props.session} isTeacher={props.isTeacher} />
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

  return (
    <main className="w-full flex flex-col px-4 py-4 flex-1">
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
};

export default AuthDashboard;
