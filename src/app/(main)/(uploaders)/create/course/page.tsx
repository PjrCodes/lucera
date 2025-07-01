import { getSessionAndUserData } from "@/lib/database-service/auth";
import CreateCourseAIForm from "@/components/feature/course/create-course-ai-form";

export default async function CreateCoursePageServer() {
  const { session, userData } = await getSessionAndUserData();

  return <CreateCourseAIForm userData={userData} session={session} />;
}
