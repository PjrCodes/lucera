import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withTeacherSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { getCoursesOwnedByTeacher, getStudentsForCourse } from "@/lib/database-service/courses";

export const GET = auth(
  withTeacherSession(async function GET(
    req: NextAuthRequest,
    session: AuthenticatedSession,
    params: Promise<{ courseId: string }>,
  ) {
    try {
      const { courseId } = await params;

      if (!courseId) {
        return NextResponse.json(
          { error: "Course ID is required" },
          { status: 400 }
        );
      }

      // Verify teacher owns this course
      const courses = await getCoursesOwnedByTeacher(session.user.id);
      const course = courses.find(c => c._id.toString() === courseId);
      
      if (!course) {
        return NextResponse.json(
          { error: "Course not found or access denied" },
          { status: 403 }
        );
      }

      const students = await getStudentsForCourse(courseId);

      return NextResponse.json({
        status: "success",
        students
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      return NextResponse.json(
        { error: "Failed to fetch students" },
        { status: 500 }
      );
    }
  })
);
