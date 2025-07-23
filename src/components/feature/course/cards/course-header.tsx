"use client";

import { Course } from "@/lib/schemas/database";
// import { SecondaryButton } from "@/components/core/buttons/secondary";
import { Edit, Bookmark, Brain } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getCourseColorStyle } from "@/lib/utils/course-colors";
import { PrimaryButton } from "@/components/core/buttons/primary";

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
    <div className="flex flex-col gap-4 bg-white rounded-xl shadow-sm border border-primary-200 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg h-12 w-12 flex items-center justify-center">
            <div className="rounded flex items-center justify-center text-white font-bold text-xl">
              {course.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-primary-800">
                {course.name}
              </h1>
              {course.courseCode && (
                <span
                  className="px-2 py-1 text-xs sm:text-sm font-medium rounded-full border self-start"
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
            <p className="text-primary-600/80 text-xs sm:text-sm mt-1">
              Course overview and materials
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PrimaryButton
            variant="outline"
            size="sm"
            onClick={handleBookmarkToggle}
            disabled={isTogglingBookmark}
            className="flex items-center gap-2"
          >
            <Bookmark
              className={`h-4 w-4 ${
                isBookmarked ? "fill-primary-600" : ""
              }`}
            />
            <span className="hidden sm:inline">{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
          </PrimaryButton>
          {!isTeacher && (
            <PrimaryButton size="sm" asChild>
              <Link href={`/quiz/${course._id}`} className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Take Quiz</span>
              </Link>
            </PrimaryButton>
          )}
          {isTeacher && (
            <PrimaryButton size="sm" asChild>
              <Link href={`/edit/course/${course._id}`} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
