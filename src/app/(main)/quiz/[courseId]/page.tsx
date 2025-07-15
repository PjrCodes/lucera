import { notFound, redirect } from "next/navigation";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { getCourseById } from "@/lib/database-service/courses";
import { getCoursesForUser } from "@/lib/database-service/courses";
import QuizPage from "@/components/feature/quiz/quiz-page";

export default async function InstantQuizPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { session, userData } = await getSessionAndUserData();
  const { courseId } = await params;

  if (!session) {
    redirect("/auth/signin");
  }

  if (userData.role !== "student") {
    redirect("/");
  }

  // Get course details
  const course = await getCourseById(courseId);
  if (!course) {
    notFound();
  }

  // Verify student is enrolled
  const enrolledCourses = await getCoursesForUser(session.user.id);
  const isEnrolled = enrolledCourses.some(
    (enrolledCourse) => enrolledCourse._id.toString() === courseId
  );

  if (!isEnrolled) {
    redirect("/");
  }

  // Serialize course data for client component
  const serializedCourse = {
    name: course.name,
    _id: course._id.toString(),
  };

  return (
    <QuizPage 
      courseName={serializedCourse.name}
      courseId={courseId}
    />
  );
}
