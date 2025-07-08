import LisaClientComponent from "@/components/feature/lisa/lisa-client-component";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import { getCoursesForUser } from "@/lib/database-service/courses";

export default async function LisaPage() {
  const { session, userData } = await getSessionAndUserData();
  const courses = await getCoursesForUser(session.user.id);

  // remove course._id to course._id.toSTring() for ecah course in courses
  courses.forEach((course) => {
    course._id = course._id.toString();
  });

  return (
    <LisaClientComponent
      session={session}
      userData={userData}
      courses={courses}
    />
  );
}
