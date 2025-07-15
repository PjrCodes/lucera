import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withTeacherSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { getCoursesOwnedByTeacher } from "@/lib/database-service/courses";

export const GET = auth(
  withTeacherSession(async function GET(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    try {
      const courses = await getCoursesOwnedByTeacher(session.user.id);

      if (!courses || courses.length === 0) {
        return NextResponse.json({
          status: "success",
          courses: [],
          message: "You haven't created any courses yet. Create your first course to get started!"
        });
      }

      return NextResponse.json({
        status: "success",
        courses
      });
    } catch (error) {
      console.error("Error fetching teacher courses:", error);
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: 500 }
      );
    }
  })
);
