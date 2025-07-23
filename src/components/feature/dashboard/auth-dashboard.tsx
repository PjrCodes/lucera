import { JSX } from "react";
import UpcomingDeadlines from "./cards/upcoming-deadlines";
import Courses from "./cards/progress";
import Bookmarks from "./cards/bookmarks";
import Create from "./cards/create";
import Announcements from "./cards/announcements";
import defaults from "@/appdata/defaults.json";
import dashboardControlList from "@/appdata/acl/dashboard.json";
import { MdBrokenImage } from "react-icons/md";
import { SessionAndDataProps } from "@/lib/interfaces/props";
import YourBadges from "./cards/your-badges";

// Component map to hold the components for the dashboard
const componentMap: Record<
  string,
  (props: SessionAndDataProps) => JSX.Element
> = {
  PROGRESS: (props) => (
    <Courses key="progress" session={props.session} userData={props.userData} />
  ),
  CLASS_PROGRESS: (props) => (
    <Courses
      key="class-progress"
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
          `"${component.split("_").join(" ")}" is not allowed to be used by ${
            isTeacher ? "teachers." : "students."
          }`
        );
        return false;
      }
      if (!columnRestrictions[columnName].includes(component)) {
        errors.push(
          `"${
            component.split("_").join(" ").toWellFormed
          }" is not allowed to be placed in the ${columnName} column.`
        );
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

export default function AuthDashboard(myProps: SessionAndDataProps) {
  // Function to render components based on layout array
  const renderComponents = (layoutArray: string[]) => {
    return (
      layoutArray
        ?.map((componentKey) => {
          const ComponentFunction = componentMap[componentKey];
          return ComponentFunction ? ComponentFunction(myProps) : null;
        })
        .filter(Boolean) || []
    );
  };

  const dashboardLayout = myProps.userData.dashboardLayout;
  const isTeacher = myProps.userData.role === "teacher";

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
      <div className="h-full p-4 bg-transparent">
        <div className="h-full flex flex-1 min-h-screen flex-col justify-center text-center text-gray-500">
          <div className="font-header text-6xl font-bold text-primary-800 mb-4">
            Hi, {myProps.session.user.name}!<br></br>Start by adding items to
            your dashboard.
          </div>
          <MdBrokenImage size={48} className="mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Empty.</h2>
          You have no components in your dashboard! Please use the edit button
          to add some!
          <br></br>
          You can also choose to reset your dashboard to the default layout.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto flex flex-col flex-1">
      {errors.length > 0 ? (
        <div className="bg-danger-100 border border-danger-200 text-danger-700 p-4 rounded-lg mb-4">
          <h2 className="font-bold text-xl">Dashboard Rendered With Errors!</h2>
          <ul className="list-disc pl-5">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
          <p className="mt-2">
            Please edit your dashboard layout to resolve these issues. It is
            recommended that you reset your dashboard to the default layout.
          </p>
        </div>
      ) : null}

      <div className="font-header text-2xl md:text-5xl font-bold text-primary-600 mb-8">
        Hi <span className="text-primary-600">{myProps.session.user.name}</span>
        <br></br>Welcome to your dashboard.
      </div>
      <div className="flex flex-wrap gap-4 flex-1">
        {/* Left Column - takes more space on large screens, full width on small */}

        <div
          className={
            "flex flex-col flex-1 min-w-[300px] gap-4" +
            (currentLayout.rightColumn.length > 0
              ? " basis-[60%]"
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
    </div>
  );
}
