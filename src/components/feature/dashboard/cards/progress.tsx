import Link from "next/link";
import React from "react";
import Image from "next/image";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { PropsForEveryDashboardCard } from "@/lib/interfaces/props";
import { getCoursesForUser } from "@/lib/database-service/courses";
import { BookAlert } from "lucide-react";

export default async function Courses({
  userData,
}: PropsForEveryDashboardCard) {
  const isTeacher = userData.role === "teacher";
  const courses = await getCoursesForUser(userData.id);

  if (!courses || courses.length === 0) {
    return (
      <div className="bg-primary-100 rounded-xl p-4 px-6">
        <div className="font-bold mb-4 text-primary-700 text-lg">
          {isTeacher ? "CLASS PROGRESS" : "PROGRESS"}
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
  const courseProgress: number[] = courses.map((course) => {
    if (isTeacher) {
      return (
        (course.completedStudentCount / course.enrolledStudentCount) * 100 || 0
      );
    } else {
      // TODO: implementation required
      return -999;
    }
  });

  return (
    <div className="bg-primary-100 rounded-lg shadow-md p-4 md:px-6 min-h-[220px] flex flex-col">
      <div className="text-lg font-bold text-primary-700 mb-4">
        {isTeacher ? "CLASS PROGRESS" : "PROGRESS"}
      </div>
      <div className={getGridClass()}>
        {courses.map((course, idx) => (
          <Link
            href="/view/course/[course_id]"
            as={`/view/course/${course._id.toString()}`}
            className="h-full block"
            key={course._id.toString()}
          >
            <div className="bg-white/80 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 h-full flex flex-col overflow-hidden">
              <Image
                width={300}
                height={300}
                src={course.coverImage || "/placeholder.jpg"}
                alt={`Thumbnail for ${course.name}`}
                className="w-full h-32 object-cover"
              />
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-base font-semibold mb-1 text-primary-700">
                  {course.name}
                </h3>
                <p className="text-sm text-primary-700 mb-2">
                  {course.courseCode}
                </p>
                <div className="mt-auto pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-primary-700">
                      Progress
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
                    className="w-full bg-primary-300 rounded-full h-2.5"
                    role="progressbar"
                    aria-valuenow={courseProgress[idx]}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Course progress: ${courseProgress[idx]}%`}
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
