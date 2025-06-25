import { getUserData } from "@/lib/database-service/auth";
import { getCoursesForUser } from "@/lib/database-service/courses";
import EditContentForm from "@/components/feature/content/edit-content-form";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { getContentById } from "@/lib/database-service/content";
import { Content, Course } from "@/lib/schemas/database";

interface EditContentPageProps {
  params: Promise<{
    content_id: string;
  }>;
}

export default async function EditContentPageServer({ params }: EditContentPageProps) {
  const resolvedParams = await params;
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

  const courses = await getCoursesForUser(session.user.id);

  // Convert ObjectId to string for client-side compatibility
  courses.forEach((course: Course) => {
    if (course._id instanceof ObjectId) {
      course._id = course._id.toString();
    }
  });

  const isNewContent = resolvedParams.content_id === "new";
  let existingContent: Content | null = null;
  if (!isNewContent) {
    existingContent = await getContentById(resolvedParams.content_id);
  }

  if (existingContent) {
    // Convert ObjectId to string for client-side compatibility
    if (existingContent._id instanceof ObjectId) {
      existingContent._id = existingContent._id.toString();
    }
  }

  return (
    <EditContentForm
      userData={userData}
      session={session}
      courses={courses}
      contentId={resolvedParams.content_id}
      existingContent={existingContent}
      isNew={isNewContent}
    />
  );
}
