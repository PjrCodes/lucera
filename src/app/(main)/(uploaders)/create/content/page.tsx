import { getUserData } from "@/lib/database/auth";
import { getCoursesForUser } from "@/lib/database/courses";
import CreateContentPage from "@/components/feature/create/create-content-form";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export default async function CreateContentPageServer() {
  const session = await auth();
  if (!session?.user?.id) {
    // Optionally redirect or render an error
    return null;
  }
  const userData = await getUserData(session.user.id);
  if (!userData) {
    // Optionally redirect or render an error
    return null;
  }
  const courses = await getCoursesForUser(session.user.id);

  // convert ObjectId to string for client-side compatibility
  courses.forEach((course) => {
    if (course._id instanceof ObjectId) {
      course._id = course._id.toString();
    }
  });

  return (
    <CreateContentPage
      userData={userData}
      session={session}
      courses={courses}
    />
  );
}
