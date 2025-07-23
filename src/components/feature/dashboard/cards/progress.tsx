import Link from "next/link";
import React from "react";
import Image from "next/image";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { SessionAndDataProps } from "@/lib/interfaces/props";
import { getCoursesForUser } from "@/lib/database-service/courses";
import { getSubmissionsForStudent } from "@/lib/database-service/submitted-assignments";
import { getAssignmentsForCourse } from "@/lib/database-service/assignment";
import { BookAlert, SquareChartGantt } from "lucide-react";
import { getCourseColorStyle } from "@/lib/utils/course-colors";
import { getFileRecord } from "@/lib/database-service/files";

export default async function Courses({ userData }: SessionAndDataProps) {
  const isTeacher = userData.role === "teacher";
  const courses = await getCoursesForUser(userData.id);

  if (!courses || courses.length === 0) {
    return (
      <div className="bg-primary-100 rounded-xl p-4 px-6">
        <div className="font-bold mb-4 text-primary-700 text-lg">
          {isTeacher ? "CLASS PROGRESS" : "COURSE PROGRESS"}
        </div>
        <div className="grid gap-4">
          {isTeacher && (
            <div className="flex-1 flex flex-col items-center justify-center text-primary-700 min-h-[100px]">
              <BookAlert className="text-5xl" />
              <p className="text-lg">No courses yet.</p>
              <Link
                href="/create/course"
                className="color-primary-600 underline hover:color-primary-500 text-sm"
              >
                Create a course.
              </Link>
            </div>
          )}
          {!isTeacher && (
            <div className="flex-1 flex flex-col items-center justify-center text-primary-700 min-h-[100px]">
              <BookAlert className="text-5xl" />
              <p className="text-lg">No courses yet.</p>
              <p className="text-sm text-primary-600 text-center">
                Ask your teachers to add you to a course!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const courseCount = courses.length;
  const showAddButton = courseCount < 6 && isTeacher;
  const totalItems = showAddButton ? courseCount + 1 : courseCount;

  // Dynamic grid classes based on total items
  const getGridClass = () => {
    if (totalItems === 1) return "grid grid-cols-1 gap-4";
    if (totalItems === 2) return "grid grid-cols-1 sm:grid-cols-2 gap-4";
    return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
  };

  // calculate courseProgress
  const courseProgress: number[] = await Promise.all(
    courses.map(async (course) => {
      if (isTeacher) {
        return (
          Math.round(
            (course.completedStudentCount / course.enrolledStudentCount) * 100
          ) || 0
        );
        // return Math.round((20 / 35) * 100); // Placeholder for teacher progress
      } else {
        // For students: calculate percentage of assignments completed
        try {
          const assignments = await getAssignmentsForCourse(
            course._id.toString()
          );
          const submissions = await getSubmissionsForStudent(
            userData.id,
            course._id.toString()
          );
          console.log("Assignments:", assignments);
          console.log("Submissions:", submissions);
          if (assignments.length === 0) {
            return 0; // No assignments yet
          }

          const completionPercentage = Math.round(
            (submissions.length / assignments.length) * 100
          );
          return completionPercentage;
        } catch (error) {
          console.error(
            `Error calculating progress for course ${course._id}:`,
            error
          );
          return 0;
        }
      }
    })
  );

  const images = await Promise.all(
    courses.map(async (course) => {
      if (!course.coverImage) {
        return "/placeholder.jpg"; // Fallback image
      }
      try {
        const fileRecord = await getFileRecord(course.coverImage);
        // Use relative URL to avoid hardcoded domain issues across environments
        return fileRecord._id
          ? `/api/files/view/${fileRecord._id.toString()}`
          : "/placeholder.jpg";
      } catch (error) {
        console.error(
          `Error loading cover image for course ${course._id}:`,
          error
        );
        return "/placeholder.jpg"; // Fallback on error
      }
    })
  );

  return (
    <div className="rounded-lg shadow-md p-4 md:px-6 min-h-[220px] flex flex-col border-2 border-primary-100">
      <div className="text-lg text-primary-700 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
            <SquareChartGantt className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          </div>
          <div className="flex flex-col text-sm sm:text-base text-primary-700">
            <h2 className="font-bold text-primary-700 gap-2 text-lg">
              {isTeacher ? "Class Progress" : "Course Progress"}
            </h2>
            <p className="text-primary-500">
              {isTeacher
                ? "Track student completion across all classes."
                : "View your course progress and assignments."}
            </p>
          </div>
        </div>
      </div>
      <div className={getGridClass()}>
        {courses.map((course, idx) => (
          <Link
            href="/view/course/[course_id]"
            as={`/view/course/${course._id.toString()}`}
            className="h-full block"
            key={course._id.toString()}
          >
            <div className="bg-primary-100/40 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col overflow-hidden">
              <Image
                width={300}
                height={300}
                src={images[idx]}
                alt={`Thumbnail for ${course.name}`}
                className="w-full h-32 object-cover"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8A0XqoC1l5s5zzPn0vNuLTcFbJ+TQ9/Y="
              />
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-base font-semibold mb-1 text-primary-700">
                  {course.name}
                </h3>
                <div className="mb-2">
                  <span
                    className="inline-block px-2 py-1 rounded text-xs font-medium"
                    style={getCourseColorStyle(course.courseColorStyle)}
                  >
                    {course.courseCode}
                  </span>
                </div>
                <div className="mt-auto pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-primary-700">
                      {isTeacher
                        ? "Student Completion %"
                        : "Assignments Completed"}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        courseProgress[idx] === 100
                          ? "text-primary-600"
                          : "text-primary-500"
                      }`}
                    >
                      {courseProgress[idx]}%
                    </span>
                  </div>
                  <div
                    className="w-full border-1 rounded-full h-2.5"
                    role="progressbar"
                    aria-valuenow={courseProgress[idx]}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${
                      isTeacher
                        ? "Student Completion %"
                        : "Assignments Completed"
                    }: ${courseProgress[idx]}%`}
                  >
                    <div
                      className={`h-2.5 rounded-full ${
                        courseProgress[idx] === 100
                          ? "bg-primary-600"
                          : "bg-primary-400"
                      }`}
                      style={{ width: `${courseProgress[idx]}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {showAddButton && (
          <SecondaryButton
            asChild
            variant="outline"
            className="flex items-center justify-center h-full min-h-[120px] border-dashed"
          >
            <Link href="/create/course">
              <span className="text-4xl">+</span>
            </Link>
          </SecondaryButton>
        )}
      </div>
    </div>
  );
}
