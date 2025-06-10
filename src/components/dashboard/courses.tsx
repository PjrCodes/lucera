import client from "@/lib/db";
import { Session } from "next-auth";
import Link from "next/link";
import React from "react";
import Image from "next/image";

interface Course {
  id: number;
  name: string;
  progress: number;
  courseCode: string;
  _id: string;
  thumbnailUrl: string;
}

interface CoursesProps {
  session: Session | null;
  isTeacher: boolean;
}

export default async function Courses({ session, isTeacher }: CoursesProps) {
  // Dummy data for courses - replace with actual data fetching later
  const coursesData = client.db().collection("courses").find({}).limit(6);
  const rawCourses = await coursesData.toArray();
  const courses: Course[] = rawCourses.map((doc, idx) => ({
    id: doc.id ?? idx,
    name: doc.name ?? "Untitled Course",
    progress: doc.progress ?? (Math.round(Math.random()) > 0.5 ? 100 : 60),
    courseCode: doc.courseCode ?? "CS101",
    _id: doc._id.toString(),
    thumbnailUrl: doc.thumbnailUrl ?? "https://placehold.co/300x200/png", // Updated placeholder image
  }));

  if (!courses || courses.length === 0) {
    return (
      <div className="bg-gray-300 rounded-xl p-4">
        <div className="font-medium mb-2">PROGRESS</div>
        <div className="grid gap-4">
          {isTeacher && (
            <Link
              href="/courses/create"
              className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-center"
            >
              <div className="text-gray-600">
                No courses found. <br /> Click here to create a new course.
              </div>
            </Link>
          )}
          {!isTeacher && (
            <div className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-center">
              <div className="text-gray-600">
                No courses available at the moment.
              </div>
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

  return (
    <div className="bg-luceragreen-1 rounded-lg shadow-md p-4 md:px-6 min-h-[220px] flex flex-col">
      <div className="text-lg font-bold text-luceragreen-5 mb-4">PROGRESS</div>
      <div className={getGridClass()}>
        {courses.map((course) => (
          <Link
            href="/courses/view/[course_id]"
            as={`/courses/view/${course._id.toString()}`}
            className="h-full block" // Simplified Link className
            key={course._id.toString()}
          >
            <div className="bg-white/80 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 h-full flex flex-col overflow-hidden">
              <Image
                width={300}
                height={300}
                src={course.thumbnailUrl}
                alt={`Thumbnail for ${course.name}`}
                className="w-full h-32 object-cover" // Thumbnail styling
              />
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-base font-semibold mb-1">{course.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {course.courseCode}
                </p>
                <div className="mt-auto pt-2">
                  {" "}
                  {/* Progress section pushed to bottom */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      Progress
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        course.progress === 100
                          ? "text-luceragreen-4"
                          : "text-luceragreen-3"
                      }`}
                    >
                      {course.progress}%
                    </span>
                  </div>
                  <div
                    className="w-full bg-gray-200 rounded-full h-2.5"
                    role="progressbar"
                    aria-valuenow={course.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Course progress: ${course.progress}%`}
                  >
                    <div
                      className={`h-2.5 rounded-full ${
                        course.progress === 100 ? "bg-luceragreen-4" : "bg-luceragreen-2"
                      }`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {showAddButton && (
          <Link
            href="/courses/create"
            className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-center hover:shadow-lg transition-shadow duration-200 border-2 border-dashed border-gray-300 hover:border-gray-400 h-full min-h-[120px]" // Kept min-h for safety, h-full should align it with other cards
          >
            <div className="text-4xl text-gray-400 hover:text-gray-600 transition-colors">
              +
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
