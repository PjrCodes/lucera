import { NextPage } from 'next'
import { Session } from 'next-auth';
import UpcomingDeadlines from './upcomingDeadlines';
import Courses from './courses';
import StudentAlerts from './studentAlerts';
import Bookmarks from './bookmarks';
import Create from './create';

interface Props {
    session: Session | null;
    isTeacher: boolean;
    dashboardLayout: any; // Replace with actual type for userData
}

const AuthDashboard: NextPage<Props> = ({ session, isTeacher, dashboardLayout }) => {


  console.log("Auth Dashboard Rendering..");
  
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
    leftColumn: ["PROGRESS", "UPCOMING_DEADLINES", "YOUR_BADGES"],
    rightColumn: ["BOOKMARKS", "CREATE"]
  };

  const currentLayout = dashboardLayout || defaultLayout;
  
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

export default AuthDashboard