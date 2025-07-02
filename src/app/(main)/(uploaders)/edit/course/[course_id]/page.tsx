import { EditCourseForm } from "@/components/feature/course/edit-course-form";
import { notFound } from "next/navigation";
import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { courseSchema } from "@/lib/schemas/database";
import { getCourseAndSyllabusById } from "@/lib/database-service/courses";

// Async wrapper to await params
export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ course_id: string }>;
}) {
  const { course_id } = await params;

  if (!course_id) {
    return notFound();
  }

  const { session, userData } = await getSessionAndUserData();

  const isNewCourse = course_id === "new";
  let courseForClient = null;

  if (!isNewCourse) {
    // Fetch existing course data
    const course = await getCourseAndSyllabusById(course_id);

    if (!course) {
      return notFound();
    }

    // Convert ObjectId to string for client component
    courseForClient = {
      ...course,
      _id: course._id.toString(),
      syllabusFile: {
        ...course.syllabusFile,
        _id: course.syllabusFile?._id?.toString?.() ?? course.syllabusFile?._id,
      },
    };

    if (!courseForClient) {
      // If the course is not found, return notFound
      return notFound();
    }
  } else {
    // For new course, we don't have any course data
    courseForClient = null;
  }

  return (
    <EditCourseForm
      course={courseForClient}
      isNew={isNewCourse}
      userData={userData}
      session={session}
    />
  );
}
