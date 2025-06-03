import client from "@/lib/db";
import Link from "next/link";
import React from "react";

export default async function Courses() {
  const coursesData = client.db().collection("courses").find({}).limit(6);
  const courses = await coursesData.toArray();

  if (!courses || courses.length === 0) {
    return (
      <div className="bg-gray-300 rounded-xl p-4">
        <div className="font-medium mb-2">PROGRESS</div>
        <div className="grid gap-4">
          <Link
            href="/courses/create"
            className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-center"
          >
            <div className="text-gray-600">
              No courses found. <br /> Click here to create a new course.
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-300 rounded-xl p-4">
      <div className="font-medium mb-2">PROGRESS</div>
      <div className="grid grid-cols-3 gap-4">
        {courses.map((course) => (
          <div
            key={course._id.toString()}
            className="bg-white rounded-lg p-4 shadow-sm"
          >
            <h3 className="text-lg font-semibold">{course.name}</h3>
            <p className="text-gray-600">{course.description}</p>
            <div className="mt-2">
              <span className="text-sm text-gray-500">
                Progress: {course.progress}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
