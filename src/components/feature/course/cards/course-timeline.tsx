import { Course } from "@/lib/schemas/database";
import { iconForType } from "@/lib/constants";
import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";

interface CourseTimelineProps {
  course: Course;
}

// Map event types to colors
const getEventColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "quiz":
      return "bg-secondary-50 text-secondary-700 border-secondary-300";
    case "assignment":
      return "bg-success-50 text-success-700 border-success-300";
    case "midsem_exam":
    case "endsem_exam":
    case "exam":
      return "bg-accent-50 text-accent-700 border-accent-300";
    case "lab_exam":
      return "bg-primary-50 text-primary-700 border-primary-300";
    case "project":
      return "bg-purple-50 text-purple-700 border-purple-300";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const getIconColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "quiz":
      return "border-secondary-300 text-secondary-400";
    case "assignment":
      return "border-success-300 text-success-400";
    case "midsem_exam":
    case "endsem_exam":
    case "exam":
      return "border-accent-300 text-accent-400";
    case "lab_exam":
      return "border-primary-300 text-primary-400";
    case "project":
      return "border-purple-300 text-purple-500";
    default:
      return "border-gray-200 text-gray-400";
  }
};

// Helper to format partial dates
function formatPartialDate(dateStr: string) {
  if (!dateStr) return "TBD";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  const weekMatch = dateStr.match(/^(\d{4})-(\d{2}) WEEK (\d)$/);
  if (weekMatch) {
    const [, year, month, week] = weekMatch;
    const monthName = new Date(`${year}-${month}-01`).toLocaleString(
      "default",
      { month: "long" },
    );
    return `Week ${week} of ${monthName} ${year}`;
  }
  const monthMatch = dateStr.match(/^(\d{4})-(\d{2})$/);
  if (monthMatch) {
    const [, year, month] = monthMatch;
    const monthName = new Date(`${year}-${month}-01`).toLocaleString(
      "default",
      { month: "long" },
    );
    return `${monthName} ${year}`;
  }
  return dateStr;
}

export default function CourseTimeline({ course }: CourseTimelineProps) {
  if (!course.timeline || course.timeline.length === 0) {
    return (
      <div className="rounded-lg shadow-md p-4 md:px-6 min-h-[250px] border-2 border-primary-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          </div>
          <div className="flex flex-col text-sm sm:text-base text-primary-700">
            <h2 className="font-bold text-primary-700 gap-2 text-lg">
              Course Timeline
            </h2>
            <p className="text-primary-500">
              Important dates and deadlines for this course.
            </p>
          </div>
        </div>
        <div className="text-center py-8 text-primary-600">
          <CalendarDays className="w-12 h-12 text-primary-300 mx-auto mb-3" />
          <p className="text-lg">No timeline events available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-md p-4 md:px-6 min-h-[250px] border-2 border-primary-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
          <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
        </div>
        <div className="flex flex-col text-sm sm:text-base text-primary-700">
          <h2 className="font-bold text-primary-700 gap-2 text-lg">
            Course Timeline
          </h2>
          <p className="text-primary-500">
            Important dates and deadlines for this course.
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {course.timeline.map((item, idx) => {
          const IconComponent = iconForType(item.type);
          const colorClass = getEventColor(item.type);
          const iconColorClass = getIconColor(item.type);

          return (
            <div
              key={idx}
              className="bg-primary-100/40 rounded-lg shadow-sm hover:shadow-md transition-shadow hover:cursor-pointer py-3 px-4"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 ${iconColorClass} flex items-center justify-center`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-medium text-primary-900 truncate">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-primary-600">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-4 h-4" />
                          <span>Start: {formatPartialDate(item.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Due: {formatPartialDate(item.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-end justify-start gap-2 flex-col">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}
                      >
                        {item.type.replace("_", " ").toUpperCase()}
                      </span>
                      {item.type === "assignment" ? (
                        <Link
                          href={`/create/assignment?courseId=${course._id.toString()}`}
                          className="flex items-center text-sm underline text-primary-600 hover:text-primary-700"
                        >
                          Create
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
