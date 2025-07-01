import { EditCourseForm } from "@/components/feature/course/edit-course-form";
import { notFound } from "next/navigation";
import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { courseSchema } from "@/lib/schemas/database";

// Async wrapper to await params
export default async function EditCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ course_id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { course_id } = await params;
  const resolvedSearchParams = await searchParams;

  if (!course_id) {
    return notFound();
  }

  const { session, userData } = await getSessionAndUserData();

  const isNewCourse = course_id === "new";
  let courseForClient = null;

  if (!isNewCourse) {
    // Fetch existing course data
    const db = client.db();
    const course = await db
      .collection("courses")
      .findOne({ _id: new ObjectId(course_id) });

    const parsedCourse = courseSchema.parse(course);

    if (!course) {
      return notFound();
    }

    // Convert ObjectId to string for client component
    courseForClient = {
      ...parsedCourse,
      _id: course._id.toString(),
    };
  }

  if (courseForClient === null && !isNewCourse) {
    return notFound();
  }

  // Check for file information in query parameters
  const hasFile = resolvedSearchParams.hasFile === "true";
  const fileName = resolvedSearchParams.fileName;

  // If it's a new course with file info, add the syllabus file name
  if (isNewCourse && hasFile && fileName) {
    if (!courseForClient) {
      courseForClient = null;
    }
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
