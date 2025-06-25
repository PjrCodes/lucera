import { getUserData } from "@/lib/database-service/auth";
import { getCoursesForUser } from "@/lib/database-service/courses";
import CreateContentUpload from "@/components/feature/create/create-content-upload";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

export default async function CreateContentPageServer() {
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
  courses.forEach((course) => {
    if (course._id instanceof ObjectId) {
      course._id = course._id.toString();
    }
  });

  return (
    <CreateContentUpload
      userData={userData}
      session={session}
      courses={courses}
    />
  );
}
