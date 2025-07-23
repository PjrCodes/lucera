import React from "react";
import Link from "next/link";
import { FiMessageSquare } from "react-icons/fi";
import { SessionAndDataProps } from "@/lib/interfaces/props";
import {
  getAnnouncementsForStudent,
  getAnnouncementsForTeacher,
} from "@/lib/database-service/announcements";
import {
  getCourseById,
  getCoursesOwnedByTeacher,
} from "@/lib/database-service/courses";
import {
  AnnouncementWithReadStatus,
  Announcement,
} from "@/lib/schemas/database";
import { getCourseColorStyle } from "@/lib/utils/course-colors";

function formatAnnouncementDate(dateStr: string | Date) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "N/A";

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

export default async function Announcements({ userData }: SessionAndDataProps) {
  const isTeacher = userData.role === "teacher";
  let announcements: (AnnouncementWithReadStatus | Announcement)[] = [];

  try {
    if (isTeacher) {
      // Get courses owned by the teacher
      const teacherCourses = await getCoursesOwnedByTeacher(userData.id);
      const courseIds = teacherCourses.map((course) => course._id.toString());
      announcements = await getAnnouncementsForTeacher(userData.id, courseIds);
    } else {
      // Get announcements for student
      announcements = await getAnnouncementsForStudent(
        userData.id,
        userData.relatedCourses
      );
    }
  } catch (error) {
    console.error("Error fetching announcements:", error);
    announcements = [];
  }

  return (
    <div className="rounded-lg shadow-md p-4 md:px-6 min-h-[300px] flex flex-col border-2 border-primary-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
          <FiMessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
        </div>
        <div className="flex flex-col text-sm sm:text-base text-primary-700">
          <h2 className="font-bold text-primary-700 text-lg">Announcements</h2>
          <p className="text-primary-500">
            {isTeacher
              ? "Your recent course announcements."
              : "Latest announcements from your courses."}
          </p>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-primary-500">
          <FiMessageSquare className="text-5xl mb-2" />
          <p className="text-lg">No announcements yet.</p>
          <p className="text-sm text-center">
            {isTeacher
              ? "Create announcements to communicate with your students."
              : "New course announcements will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {announcements.map(async (announcement) => {
            const isUnread = "isRead" in announcement && !announcement.isRead;
            const course = await getCourseById(announcement.courseId);
            return (
              <Link
                key={announcement._id.toString()}
                href={`/messages`}
                className="block"
              >
                <div
                  className={`bg-primary-100/40 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer p-4 ${
                    isUnread ? "border-l-4 border-primary-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-primary-700 text-base line-clamp-1 flex-1">
                      {announcement.title}
                    </h3>
                    <span
                      className="inline-block px-2 py-1 rounded text-xs font-medium"
                      style={getCourseColorStyle(course.courseColorStyle)}
                    >
                      {announcement.courseCode}
                    </span>
                    {isUnread && (
                      <span className="self-center ml-2 inline-block w-2 h-2 bg-primary-500 rounded-full"></span>
                    )}
                  </div>

                  <p className="text-sm text-primary-600 line-clamp-2">
                    {announcement.content}
                  </p>
                  <span className="text-xs text-primary-400 whitespace-nowrap">
                    {formatAnnouncementDate(announcement.createdAt)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
