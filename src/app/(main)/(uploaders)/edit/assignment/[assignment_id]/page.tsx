import { getSessionAndUserData } from "@/lib/database-service/auth";
import { getCoursesForUser } from "@/lib/database-service/courses";
import { ObjectId } from "mongodb";
import { getAssignmentById } from "@/lib/database-service/assignment";
import { Assignment, Course } from "@/lib/schemas/database";
import EditAssignmentForm from "@/components/feature/assignment/edit-assignment-form";

interface EditAssignmentPageProps {
  params: Promise<{
    assignment_id: string;
  }>;
}

export default async function EditAssignmentPageServer({
  params,
}: EditAssignmentPageProps) {
  const resolvedParams = await params;
  const { session, userData } = await getSessionAndUserData();
  const courses = await getCoursesForUser(session.user.id);

  // Convert ObjectId to string for client-side compatibility
  courses.forEach((course: Course) => {
    if (course._id instanceof ObjectId) {
      course._id = course._id.toString();
    }
  });

  const isNewContent = resolvedParams.assignment_id === "new";
  let existingContent: Assignment | null = null;
  if (!isNewContent) {
    existingContent = await getAssignmentById(resolvedParams.assignment_id);
  }

  if (existingContent) {
    // Convert ObjectId to string for client-side compatibility
    if (existingContent._id instanceof ObjectId) {
      existingContent._id = existingContent._id.toString();
    }
  }

  return (
    <EditAssignmentForm
      userData={userData}
      session={session}
      courses={courses}
      contentId={resolvedParams.assignment_id}
      existingContent={existingContent}
      isNew={isNewContent}
    />
  );
}
