import { getUserData } from "@/lib/database/auth";
import { getCoursesForUser } from "@/lib/database/courses";
import EditContentForm from "@/components/feature/edit/edit-content-form";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

interface EditContentPageProps {
  params: {
    content_id: string;
  };
}

export default async function EditContentPageServer({ params }: EditContentPageProps) {

  params = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const userData = await getUserData(session.user.id);
  if (!userData) {
    return null;
  }

  const courses = await getCoursesForUser(session.user.id);

  // Convert ObjectId to string for client-side compatibility
  courses.forEach((course) => {
    if (course._id instanceof ObjectId) {
      course._id = course._id.toString();
    }
  });

  const isNewContent = params.content_id === "new";

  // TODO: If not new, fetch existing content data
  let existingContent = null;
  if (!isNewContent) {
    // existingContent = await getContentById(params.content_id);
  }

  return (
    <EditContentForm
      userData={userData}
      session={session}
      courses={courses}
      contentId={params.content_id}
      existingContent={existingContent}
      isNew={isNewContent}
    />
  );
}
