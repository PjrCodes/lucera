import { getSessionAndUserData } from "@/lib/database-service/auth";
import { getAssignmentById } from "@/lib/database-service/assignment";
import { notFound, redirect } from "next/navigation";
import AssignmentSubmissionsView from "@/components/feature/assignment/assignment-submissions-view";
import { checkTeacherhood } from "@/lib/database-service/auth";

interface SubmissionsPageProps {
  params: Promise<{
    assignment_id: string;
  }>;
}

export default async function SubmissionsPage({ params }: SubmissionsPageProps) {
  const { assignment_id } = await params;

  // Get session and user data
  const { session } = await getSessionAndUserData();

  // Check if user is a teacher
  const isTeacher = await checkTeacherhood(session.user.id);
  if (!isTeacher) {
    redirect("/not-found");
  }

  try {
    // Verify assignment exists
    await getAssignmentById(assignment_id);

    return (
      <div className="container mx-auto px-4 py-8">
        <AssignmentSubmissionsView
          assignmentId={assignment_id}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading assignment submissions:", error);
    notFound();
  }
}
