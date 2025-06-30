import { getUserData, serverComponentRedirectUnauthenticated } from "@/lib/database-service/auth";
import { getCoursesForUser } from "@/lib/database-service/courses";
import CreateContentAIForm from "@/components/feature/content/create-content-ai-form";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

export default async function CreateContentPageServer() {
  const session = await serverComponentRedirectUnauthenticated();
  let userData;
  try {
    userData = await getUserData(session.user.id);
  } catch {
    redirect("/handle-invalid-user");
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
    <CreateContentAIForm
      userData={userData}
      session={session}
      courses={courses}
    />
  );
}
