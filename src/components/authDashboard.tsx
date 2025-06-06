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
  
  // Dummy data
  const dummyDeadlines = [
    { id: 1, title: "Math Assignment 2", dueDate: "2024-06-10", course: "Mathematics" },
    { id: 2, title: "History Project", dueDate: "2024-06-12", course: "History" }
  ];

  const dummyCourses = [
    { id: 1, name: "Mathematics", progress: 80 },
    { id: 2, name: "History", progress: 60 }
  ];

  const dummyAlerts = [
    { id: 1, message: "You earned a badge: Quick Learner!", date: "2024-06-01" },
    { id: 2, message: "Assignment overdue: Science Homework", date: "2024-05-30" }
  ];

  const dummyBookmarks = [
    { id: 1, title: "Algebra Basics", url: "https://example.com/algebra" },
    { id: 2, title: "World War II Documentary", url: "https://example.com/ww2" }
  ];

  const dummyCreateOptions = [
    { id: 1, type: "Assignment", label: "Create Assignment" },
    { id: 2, type: "Quiz", label: "Create Quiz" }
  ];

  // Component mapping
  const componentMap = {
    WHATS_NEXT: <UpcomingDeadlines key="whats-next" deadlines={dummyDeadlines} />,
    PROGRESS: <Courses key="progress" isTeacher={isTeacher} user={session?.user} courses={dummyCourses} />,
    YOUR_BADGES: <StudentAlerts key="your-badges" alerts={dummyAlerts} />,
    BOOKMARKS: <Bookmarks key="bookmarks" bookmarks={dummyBookmarks} />,
    UPCOMING_DEADLINES: <UpcomingDeadlines key="upcoming-deadlines" deadlines={dummyDeadlines} />,
    CREATE: <Create key="create" options={dummyCreateOptions} />
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