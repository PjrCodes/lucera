import { getSessionAndUserData } from "@/lib/database-service/auth";
import { getCoursesForUser } from "@/lib/database-service/courses";
import CreateContentAIForm from "@/components/feature/content/create-content-ai-form";
import { ObjectId } from "mongodb";

export default async function CreateContentPageServer() {
  const { session, userData } = await getSessionAndUserData();

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
