import React from "react";
import { Session } from "next-auth";

interface Deadline {
  id: number;
  title: string;
  dueDate: string;
  course: string;
}

interface Props {
  session: Session | null;
  isTeacher: boolean;
}

const typeIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("assignment")) return "📝";
  if (t.includes("exam")) return "🧾";
  if (t.includes("project")) return "💡";
  if (t.includes("quiz")) return "❓";
  if (t.includes("lab")) return "🧪";
  if (t.includes("case study")) return "📖";
  if (t.includes("workshop") || t.includes("tutorial")) return "🛠️";
  return "📅";
};

const typeColor = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("assignment")) return "bg-green-100 text-green-800";
  if (t.includes("exam")) return "bg-purple-100 text-purple-800";
  if (t.includes("project")) return "bg-yellow-100 text-yellow-800";
  if (t.includes("quiz")) return "bg-blue-100 text-blue-800";
  if (t.includes("lab")) return "bg-teal-100 text-teal-800";
  if (t.includes("case study")) return "bg-pink-100 text-pink-800";
  if (t.includes("workshop") || t.includes("tutorial")) return "bg-indigo-100 text-indigo-800";
  return "bg-gray-100 text-gray-800";
};

function formatDate(dateStr: string) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const now = new Date();
  // Reset time to compare just dates
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Calculate difference in days
  const diffTime = dateOnly.getTime() - nowDateOnly.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  // Check if time is present in the date string (not midnight)
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
  
  // Format time
  let timeStr = "";
  if (hasTime) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    timeStr = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
  
  // Handle overdue for same day events by comparing time
  if (diffDays === 0 && hasTime) {
    if (date.getTime() < now.getTime()) {
      return `Overdue (Today at ${timeStr})`;
    }
  }
  
  // Handle special cases
  if (diffDays < 0) {
    // Overdue
    if (diffDays === -1) {
      return hasTime ? `Overdue (Yesterday at ${timeStr})` : "Overdue (Yesterday)";
    } else {
      return hasTime ? `Overdue (${Math.abs(diffDays)} days ago at ${timeStr})` : `Overdue (${Math.abs(diffDays)} days ago)`;
    }
  } else if (diffDays === 0) {
    // Today
    return hasTime ? `Today at ${timeStr}` : "Today";
  } else if (diffDays === 1) {
    // Tomorrow
    return hasTime ? `Tomorrow at ${timeStr}` : "Tomorrow";
  } else if (diffDays === 2) {
    // Day after tomorrow
    return hasTime ? `Day after tomorrow at ${timeStr}` : "Day after tomorrow";
  } else if (diffDays < 7) {
    // Within a week
    return hasTime ? `In ${diffDays} days at ${timeStr}` : `In ${diffDays} days`;
  } else if (diffDays < 30) {
    // Within a month but beyond a week - don't show time
    return `In ${diffDays} days`;
  }
  
  // For other dates, show formatted date without time for far future
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  // Capitalize the month name
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `${day} ${capitalizedMonth} ${year}`;
}

// Add a function to determine the color based on deadline proximity
const getDeadlineColor = (dateStr: string) => {
  if (!dateStr) return "text-gray-600";
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "text-gray-600";
  
  const now = new Date();
  // Reset time to compare just dates
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Calculate difference in days
  const diffTime = dateOnly.getTime() - nowDateOnly.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  // Same-day deadline with time passed
  if (diffDays === 0 && date.getTime() < now.getTime()) {
    return "text-lucerared-3 font-bold";
  }
  
  // Past deadlines
  if (diffDays < 0) {
    return "text-lucerared-3 font-bold";
  }
  
  // Today, tomorrow, or day after tomorrow
  if (diffDays === 0) return "text-lucerared-3 font-semibold";
  if (diffDays === 1) return "text-lucerayellow-5 font-semibold";
  if (diffDays === 2) return "text-lucerayellow-5";
  // Further in the future
  return "text-lucerablue-5";
};

const UpcomingDeadlines: React.FC<Props> = ({ session, isTeacher }) => {
  // Create deadlines with varied dates to showcase different colors
  const today = new Date("2025-06-09T19:00:00Z"); // Fixed date for consistency in examples
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 6);
  
  const farFuture = new Date(today);
  farFuture.setDate(today.getDate() + 30);
  
  // Format dates as strings
  const formatDateToString = (date: Date) => {
    return date.toISOString().split('T')[0] + 
      (date === today ? " 08:00:00" : 
       date === yesterday ? " 15:00:00" : 
       date === tomorrow ? " 10:00:00" : "");
  };
  
  // Dummy data for deadlines showing all deadline states
  const dummyDeadlines: Deadline[] = [
    {
      id: 10,
      title: "Overdue Assignment",
      dueDate: formatDateToString(yesterday),
      course: "CS101"
    },
    {
      id: 1,
      title: "Overdue Assignment",
      dueDate: "2025-06-09 20:00:00", // Overdue with time
      course: "CS101"
    },
    {
      id: 2,
      title: "Due Today",
      dueDate: formatDateToString(today),
      course: "CS201"
    },
    {
      id: 3,
      title: "Due Tomorrow",
      dueDate: formatDateToString(tomorrow),
      course: "CS301"
    },
    {
      id: 4,
      title: "Project Presentation",
      dueDate: formatDateToString(dayAfterTomorrow),
      course: "CS401"
    },
    {
      id: 5,
      title: "Weekly Quiz",
      dueDate: formatDateToString(nextWeek),
      course: "CS501"
    },
    {
      id: 6,
      title: "Final Project",
      dueDate: formatDateToString(farFuture),
      course: "CS601"
    }
  ];

  const deadlines = dummyDeadlines;

  return (
    <div className="bg-lucerablue-2 rounded shadow p-4 min-h-[220px]">
      <h2 className="font-bold mb-4 text-blue-900 flex items-center gap-2">
        UPCOMING DEADLINES
      </h2>
      <ul className="space-y-3">
        {deadlines.map((dl) => (
          <li key={dl.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-lucerablue-1 rounded-lg shadow-sm px-3 py-2 hover:bg-lucerablue-1/70 transition">
            <span className="text-2xl hidden sm:block">{typeIcon(dl.title)}</span>
            
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center w-full">
              <div className="flex items-center gap-2 mb-1 sm:mb-0">
                <span className="text-xl sm:hidden mr-1">{typeIcon(dl.title)}</span>
                <span className="font-semibold text-blue-900 text-sm sm:text-base">{dl.title}</span>
              </div>
              
              <span className={`self-start sm:ml-2 px-2 py-0.5 rounded text-xs font-medium ${typeColor(dl.title)}`}>
                {dl.course}
              </span>
            </div>
            
            <span className={`text-xs sm:text-sm ${getDeadlineColor(dl.dueDate)} mt-1 sm:mt-0`}>
              {formatDate(dl.dueDate)}
            </span>
          </li>
        ))}
      </ul>
      {deadlines.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🎉</div>
          <p>No upcoming deadlines!</p>
        </div>
      )}
    </div>
  );
};

export default UpcomingDeadlines;
