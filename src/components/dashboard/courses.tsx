import client from "@/lib/db";
import { Session } from "next-auth";
import Link from "next/link";
import React from "react";

interface Course {
  id: number;
  name: string;
  progress: number;
  courseCode: string;
  _id: string;
}

interface CoursesProps {
  session: Session | null;
  isTeacher: boolean;
}

export default async function Courses({
  session,
  isTeacher,
}: CoursesProps) {
  // Dummy data for courses - replace with actual data fetching later
  const coursesData = client.db().collection("courses").find({}).limit(6);
  const rawCourses = await coursesData.toArray();
  const courses: Course[] = rawCourses.map((doc, idx) => ({
    id: doc.id ?? idx,
    name: doc.name ?? "",
    progress: doc.progress ?? 0,
    courseCode: doc.courseCode ?? "",
    _id: doc._id.toString(),
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
    <div className="bg-green-50 rounded shadow p-4 min-h-[220px]">
      <div className="font-medium mb-2 text-green-900">PROGRESS</div>
      <div className={getGridClass()}>
        {courses.map((course) => (
          <Link
            href="/courses/view/[course_id]"
            as={`/courses/view/${course._id.toString()}`}
            className=" transition-shadow duration-200 h-full"
            key={course._id.toString()}
          >
            <div className="hover:shadow-lg bg-white rounded-lg p-4 shadow-sm h-full flex flex-col">
              <h3 className="text-lg font-semibold">{course.name}</h3>
              <p className="text-gray-600">{course.courseCode}</p>
              <div className="mt-2 mt-auto">
                {/*for students: it show progress of topics completed. For teachers: it shows number of students completed type thing. */}
                <span className="text-sm text-gray-500">
                  Progress: {course.progress}%
                </span>
              </div>
            </div>
          </Link>
        ))}
        {showAddButton && (
          <Link
            href="/courses/create"
            className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-center hover:shadow-lg transition-shadow duration-200 border-2 border-dashed border-gray-300 hover:border-gray-400 h-full min-h-[120px]"
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
