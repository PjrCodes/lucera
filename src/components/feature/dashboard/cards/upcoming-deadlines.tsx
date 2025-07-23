import React from "react";
import { iconForType } from "../../../../lib/constants"; // Import the icons
import { PiConfetti } from "react-icons/pi";
import { SessionAndDataProps } from "@/lib/interfaces/props";
import { Deadline } from "@/lib/types/lib"; // Import the Deadline type
import { getUpcomingDeadlines } from "@/lib/database-service/assignment";
import { getCourseColorStyle } from "@/lib/utils/course-colors";
import { SquareChartGantt } from "lucide-react";
import Link from "next/link";

function formatDate(dateStr: string) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const now = new Date();
  // Reset time to compare just dates
  const nowDateOnly = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

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
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    timeStr = `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
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
      return hasTime
        ? `Overdue (Yesterday at ${timeStr})`
        : "Overdue (Yesterday)";
    } else {
      return hasTime
        ? `Overdue (${Math.abs(diffDays)} days ago at ${timeStr})`
        : `Overdue (${Math.abs(diffDays)} days ago)`;
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
    return hasTime
      ? `In ${diffDays} days at ${timeStr}`
      : `In ${diffDays} days`;
  } else if (diffDays < 30) {
    // Within a month but beyond a week - don't show time
    return `In ${diffDays} days`;
  }

  // For other dates, show formatted date without time for far future
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
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
  const nowDateOnly = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  // Calculate difference in days
  const diffTime = dateOnly.getTime() - nowDateOnly.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // Same-day deadline with time passed
  if (diffDays === 0 && date.getTime() < now.getTime()) {
    return "text-danger-500 font-bold";
  }

  // Past deadlines
  if (diffDays < 0) {
    return "text-danger-500 font-bold";
  }

  // Today, tomorrow, or day after tomorrow
  if (diffDays === 0) return "text-danger-500 font-semibold";
  if (diffDays === 1) return "text-warning-600 font-semibold";
  if (diffDays === 2) return "text-warning-600 font-semibold";
  // Further in the future
  return "text-info-700";
};

// Function to get the correct navigation URL based on deadline type
const getDeadlineUrl = (deadline: Deadline) => {
  switch (deadline.type) {
    case "assignment":
      // For assignment deadlines, navigate to the specific assignment page if assignmentId exists
      // Otherwise, fallback to the course page
      return deadline.assignmentId
        ? `/view/assignment/${deadline.assignmentId}`
        : `/view/course/${deadline.courseId}`;
    case "grading":
      // For grading deadlines, navigate to the assignment page for teachers to see submissions
      return deadline.assignmentId
        ? `/view/assignment/${deadline.assignmentId}`
        : `/view/course/${deadline.courseId}`;
    case "quiz":
      // For quiz deadlines, navigate to the course quiz page
      return `/quiz/${deadline.courseId}`;
    case "exam":
    case "midsem_exam":
    case "endsem_exam":
    case "lab_exam":
      // For exam deadlines, navigate to the course page where exam info is displayed
      return `/view/course/${deadline.courseId}`;
    case "project":
    case "lab":
      // For project and lab deadlines, navigate to the course page
      return `/view/course/${deadline.courseId}`;
    default:
      // Default fallback to course page for any unknown deadline types
      return `/view/course/${deadline.courseId}`;
  }
};

export default async function UpcomingDeadlines({
  userData,
}: SessionAndDataProps) {
  // Create deadlines with varied dates to showcase different colors
  const today = new Date();

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
  // const formatDateToString = (date: Date) => {
  //   return (
  //     date.toISOString().split("T")[0] +
  //     (date === today
  //       ? " 08:00:00"
  //       : date === yesterday
  //         ? " 15:00:00"
  //         : date === tomorrow
  //           ? " 10:00:00"
  //           : "")
  //   );
  // };

  // Dummy data for deadlines showing all deadline states
  // const dummyDeadlines: Deadline[] = [
  //   // {
  //   //   id: 10,
  //   //   title: "Assignment 24: Recursion",
  //   //   dueDate: formatDateToString(yesterday),
  //   //   course: "CS101: Introduction to Programming",
  //   //   type: "assignment",
  //   //   courseColor: "bg-amber-2 text-amber-5",
  //   // },
  //   // {
  //   //   id: 1,
  //   //   title: "Mid-sem Take-Home Examination", // Changed to Exam for variety
  //   //   dueDate: "2025-07-04 20:00:00", // Overdue with time
  //   //   course: "CS101",
  //   //   type: "exam",
  //   //   courseColor: "bg-green-2 text-green-5",
  //   // },
  //   // {
  //   //   id: 3,
  //   //   title: "Quiz Due Today", // Changed to Quiz
  //   //   dueDate: "2025-08-03 15:00:00", // Due today with time
  //   //   course: "CS201",
  //   //   type: "quiz",
  //   //   courseColor: "bg-blue-2 text-blue-5",
  //   // },
  //   // {
  //   //   id: 3,
  //   //   title: "Lab Due Tomorrow", // Changed to Lab
  //   //   dueDate: formatDateToString(tomorrow),
  //   //   course: "CS301",
  //   //   type: "lab"
  //   // },
  //   // {
  //   //   id: 4,
  //   //   title: "Project Presentation",
  //   //   dueDate: formatDateToString(dayAfterTomorrow),
  //   //   course: "CS401",
  //   //   type: "project"
  //   // },
  //   // {
  //   //   id: 5,
  //   //   title: "Weekly Quiz",
  //   //   dueDate: formatDateToString(nextWeek),
  //   //   course: "CS501",
  //   //   type: "quiz"
  //   // },
  //   // {
  //   //   id: 6,
  //   //   title: "Final Project",
  //   //   dueDate: formatDateToString(farFuture),
  //   //   course: "CS601",
  //   //   type: "project"
  //   // }
  // ];

  const deadlines = await getUpcomingDeadlines(userData.id);

  return (
    <div className="rounded-lg shadow-md p-4 md:px-6 min-h-[250px] border-2 border-primary-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
          <SquareChartGantt className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
        </div>
        <div className="flex flex-col text-sm sm:text-base text-primary-700">
          <h2 className="font-bold text-primary-700 gap-2 text-lg">
            Upcoming Deadlines
          </h2>
          <p className="text-primary-500">
            Important deadlines coming up in the next few weeks.
          </p>
        </div>
      </div>
      <ul className="space-y-2">
        {deadlines.map((dl) => {
          const IconComponent = iconForType(dl.type);
          const deadlineUrl = getDeadlineUrl(dl);
          return (
            <li key={dl.id}>
              <Link
                href={deadlineUrl}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-3 bg-primary-100/40 rounded-lg shadow-sm hover:shadow-md transition-shadow hover:cursor-pointer py-2 px-2 block"
              >
                <div className="flex items-start md:items-center gap-2 md:gap-3">
                  <div className="">
                    <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-primary-600" />
                  </div>
                  <p className="font-medium text-primary-700 text-sm md:text-base">
                    {dl.title}
                  </p>

                  <span
                    className="self-start md:self-center md:ml-2 px-2 py-0.5 rounded text-xs font-medium"
                    style={getCourseColorStyle(dl.courseColor)}
                  >
                    {dl.courseCode}
                  </span>
                </div>
                <span
                  className={`text-xs md:text-sm ${getDeadlineColor(
                    dl.dueDate
                  )} mt-1 md:mt-0`}
                >
                  {formatDate(dl.dueDate)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {deadlines.length === 0 && (
        <div className="text-center py-8 text-primary-700">
          <div className="text-5xl mb-2">
            <PiConfetti className="inline-block" />
          </div>
          <p className="text-lg">No more deadlines!</p>
        </div>
      )}
    </div>
  );
}
