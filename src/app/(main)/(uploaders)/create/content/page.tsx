import { getUserData } from "@/lib/database/auth";
import { getCoursesForUser } from "@/lib/database/courses";
import CreateContentUpload from "@/components/feature/create/create-content-upload";
import { auth } from "@/lib/auth";

export default async function CreateContentPageServer() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  const userData = await getUserData(session.user.id);
  if (!userData) {
    return null;
  }
  const courses = await getCoursesForUser(session.user.id);

  return (
    <CreateContentUpload
      userData={userData}
      session={session}
      courses={courses}
    />
  );
}
