import { EditCourseForm } from '@/components/feature/course/edit-course-form';
import { notFound, redirect } from 'next/navigation';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';
import { getUserData } from "@/lib/database-service/auth";
import { auth } from "@/lib/auth";

// Async wrapper to await params
export default async function EditCoursePage({ params }: { params: Promise<{ course_id: string }> }) {
  const { course_id } = await params;

  if (!course_id) {
    return notFound();
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }
  const userData = await getUserData(session.user.id);
  if (!userData) {
    redirect("/");
  }
  if (userData.role !== "teacher") {
    redirect("/");
  }

  const isNewCourse = course_id === "new";
  let courseForClient = null;

  if (!isNewCourse) {
    // Fetch existing course data
    const db = client.db();
    const course = await db.collection('courses').findOne({ _id: new ObjectId(course_id) });

    if (!course) {
      return notFound();
    }

    // Convert ObjectId to string for client component
    courseForClient = {
      ...course,
      _id: course._id.toString()
    };
  }

  if (courseForClient === null && !isNewCourse) {
    return notFound();
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
