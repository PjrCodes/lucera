import React from "react";
import { iconForType } from "../../../../lib/constants"; // Import the icons
import { PiConfetti } from "react-icons/pi";
import { PropsForEveryDashboardCard } from "@/lib/interfaces";

interface Deadline {
  id: number;
  title: string;
  dueDate: string;
  course: string;
  type: string;
  courseColor: string;
}

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


export default function UpcomingDeadlines({ }: PropsForEveryDashboardCard) {
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
      title: "Assignment 24: Recursion",
      dueDate: formatDateToString(yesterday),
      course: "CS101: Introduction to Programming",
      type: "assignment",
      courseColor: "bg-lucerablue-2 text-lucerablue-5"
    },
    {
      id: 1,
      title: "Mid-sem Take-Home Examination", // Changed to Exam for variety
      dueDate: "2025-06-12 20:00:00", // Overdue with time
      course: "CS101",
      type: "exam",
      courseColor: "bg-lucerared-2 text-lucerared-5"
    }
    // {
    //   id: 2,
    //   title: "Quiz Due Today", // Changed to Quiz
    //   dueDate: formatDateToString(today),
    //   course: "CS201",
    //   type: "quiz"
    // },
    // {
    //   id: 3,
    //   title: "Lab Due Tomorrow", // Changed to Lab
    //   dueDate: formatDateToString(tomorrow),
    //   course: "CS301",
    //   type: "lab"
    // },
    // {
    //   id: 4,
    //   title: "Project Presentation",
    //   dueDate: formatDateToString(dayAfterTomorrow),
    //   course: "CS401",
    //   type: "project"
    // },
    // {
    //   id: 5,
    //   title: "Weekly Quiz",
    //   dueDate: formatDateToString(nextWeek),
    //   course: "CS501",
    //   type: "quiz"
    // },
    // {
    //   id: 6,
    //   title: "Final Project",
    //   dueDate: formatDateToString(farFuture),
    //   course: "CS601",
    //   type: "project"
    // }
  ];

  const deadlines = dummyDeadlines;

  return (
    <div className="bg-primary-100 rounded-lg shadow-md p-4 md:px-6 min-h-[250px]">
      <h2 className="font-bold mb-4 text-primary-700 flex items-center gap-2 text-lg">
        UPCOMING DEADLINES
      </h2>
      <ul className="space-y-3">
        {deadlines.map((dl) => {
          const IconComponent = iconForType(dl.type);
          return (
            <li key={dl.id} className="flex flex-col md:flex-row items-start md:items-center justify-center gap-2 md:gap-3 bg-white/80 rounded-lg shadow-sm px-3 py-2 hover:shadow-md transition-shadow hover:cursor-pointer">
              <div className="flex-1 flex flex-col md:flex-row md:items-center w-full">
                <div className="flex items-center gap-2 mb-1 md:mb-0">
                  <span className="text-xl md:text-3xl mr-1 text-primary-700">
                    <IconComponent />
                  </span>
                  <span className="font-semibold text-primary-700 text-sm md:text-base">{dl.title}</span>
                </div>
                <span className={`self-start md:self-center md:ml-2 px-2 py-0.5 rounded text-xs font-medium ${dl.courseColor}`}>
                  {dl.course}
                </span>
              </div>
              <span className={`text-xs md:text-sm ${getDeadlineColor(dl.dueDate)} mt-1 md:mt-0`}>
                {formatDate(dl.dueDate)}
              </span>
            </li>
          );
        })}
      </ul>
      {deadlines.length === 0 && (
        <div className="text-center py-8 text-lucerablue-4">
          <div className="text-5xl mb-2">
            <PiConfetti className="inline-block" />
          </div>
          <p className="text-lg">No more deadlines!</p>
        </div>
      )}
    </div>
  );
};
