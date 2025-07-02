import { getSessionAndUserData } from "@/lib/database-service/auth";
import { getCoursesForUser } from "@/lib/database-service/courses";
import CreateAssignmentAIForm from "@/components/feature/assignment/create-assignment-ai-form";
import { ObjectId } from "mongodb";
export default async function CreateContentPageServer({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const resolvedParams = await searchParams;
  const { session, userData } = await getSessionAndUserData();

  const courses = await getCoursesForUser(session.user.id);
  courses.forEach((course) => {
    if (course._id instanceof ObjectId) {
      course._id = course._id.toString();
    }
  });

  const defaultCourseId = resolvedParams.courseId;

  return (
    <CreateAssignmentAIForm
      userData={userData}
      session={session}
      courses={courses}
      defaultCourseId={defaultCourseId}
    />
  );
}
