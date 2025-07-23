"use client";

import { Course } from "@/lib/schemas/database";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { Edit, Bookmark, Brain } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getCourseColorStyle } from "@/lib/utils/course-colors";

interface CourseHeaderProps {
  course: Course;
  isTeacher?: boolean;
  isBookmarked?: boolean;
}

export default function CourseHeader({
  course,
  isTeacher = false,
  isBookmarked: initialIsBookmarked = false,
}: CourseHeaderProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isTogglingBookmark, setIsTogglingBookmark] = useState(false);

  const handleBookmarkToggle = async () => {
    setIsTogglingBookmark(true);
    try {
      const response = await fetch("/api/bookmarks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "course",
          relatedId: course._id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.isBookmarked);
      } else {
        console.error("Failed to toggle bookmark");
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setIsTogglingBookmark(false);
    }
  };

  return (
    <div className="bg-linear-to-r from-primary-25 to-primary-50 rounded-xl shadow border border-primary-100 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-secondary-400 to-secondary-700 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            {course.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-primary-900">
                {course.name}
              </h1>
              {course.courseCode && (
                <span
                  className="px-3 py-1 text-sm font-medium rounded-full border"
                  style={course.courseColorStyle ? getCourseColorStyle(course.courseColorStyle) : {
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    borderColor: '#d1d5db'
                  }}
                >
                  {course.courseCode}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SecondaryButton
            // variant="outline"
            size="sm"
            onClick={handleBookmarkToggle}
            disabled={isTogglingBookmark}
          >
            <Bookmark
              className={`h-4 w-4 ${
                isBookmarked ? "fill-secondary-200 text-secondary-200" : ""
              }`}
            />
          </SecondaryButton>
          {!isTeacher && (
            <SecondaryButton size="sm">
              <Link href={`/quiz/${course._id}`} className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Take Quiz
              </Link>
            </SecondaryButton>
          )}
          {isTeacher && (
            <SecondaryButton size="sm">
              <Link href={`/edit/course/${course._id}`}>
                <Edit className="h-4 w-4" />
              </Link>
            </SecondaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
