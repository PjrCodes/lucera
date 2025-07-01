import React from "react";
import Link from "next/link";
import { FiMessageSquare } from "react-icons/fi";
import { PropsForEveryDashboardCard } from "@/lib/interfaces/props";

interface Announcement {
  id: number;
  title: string;
  content: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  courseColor: string;
  date: string;
}

function formatAnnouncementDate(dateStr: string) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 60) {
    return diffMinutes <= 1 ? "Just now" : `${diffMinutes} mins ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    return `${day} ${month}`;
  }
}

export default function Announcements({}: PropsForEveryDashboardCard) {
  // Mock announcements data
  const dummyAnnouncements: Announcement[] = [
    {
      id: 1,
      title: "Mid-semester Break Notice",
      content:
        "Classes will be suspended from June 15-20 for mid-semester break. All assignments due during this period have been extended.",
      courseId: "cs101",
      courseName: "Introduction to Programming",
      courseCode: "CS101",
      courseColor: "bg-lucerablue-2 text-lucerablue-5",
      date: "2025-06-09T08:00:00Z",
    },
    {
      id: 2,
      title: "Guest Lecture Tomorrow",
      content:
        "Dr. Sarah Chen from MIT will be giving a guest lecture on 'Advanced Machine Learning Techniques' tomorrow at 2 PM in Hall A.",
      courseId: "cs301",
      courseName: "Machine Learning",
      courseCode: "CS301",
      courseColor: "bg-lucerared-2 text-lucerared-5",
      date: "2025-06-08T14:30:00Z",
    },
    {
      id: 3,
      title: "Lab Session Rescheduled",
      content:
        "Thursday's lab session has been moved to Friday 10 AM due to equipment maintenance.",
      courseId: "cs201",
      courseName: "Data Structures",
      courseCode: "CS201",
      courseColor: "bg-lucerayellow-2 text-lucerayellow-5",
      date: "2025-06-07T16:45:00Z",
    },
    {
      id: 4,
      title: "New Study Materials Available",
      content:
        "Additional practice problems and solutions for Chapter 5 have been uploaded to the course resources.",
      courseId: "math201",
      courseName: "Discrete Mathematics",
      courseCode: "MATH201",
      courseColor: "bg-primary-2 text-primary-5",
      date: "2025-06-06T11:20:00Z",
    },
  ];

  const announcements = dummyAnnouncements;

  return (
    <div className="bg-primary-100 rounded-lg shadow-md p-4 md:px-6 min-h-[300px] flex flex-col">
      <h2 className="text-lg font-bold text-primary-700 mb-4 flex items-center gap-2">
        ANNOUNCEMENTS
      </h2>

      {announcements.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-primary-500">
          <FiMessageSquare className="text-5xl mb-2" />
          <p className="text-lg">No announcements yet.</p>
          <p className="text-sm text-center">
            New course announcements will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2 flex-1 overflow-y-auto">
          {announcements.map((announcement) => (
            <Link
              key={announcement.id}
              href={`/courses/${announcement.courseId}#announcements`}
              className="block"
            >
              <div className="bg-white/80 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-2">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-primary-700 text-sm line-clamp-1">
                    {announcement.title}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {formatAnnouncementDate(announcement.date)}
                  </span>
                </div>

                <div className="mb-1">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${announcement.courseColor}`}
                  >
                    {announcement.courseCode}
                  </span>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">
                  {announcement.content}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
