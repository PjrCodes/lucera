import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withAuthorisation } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import {
  getAnnouncementsForStudent,
  getAnnouncementsForTeacher
} from "@/lib/database-service/announcements";
import { getUserData } from "@/lib/database-service/auth";
import { getCoursesOwnedByTeacher } from "@/lib/database-service/courses";

export const GET = auth(
  withAuthorisation(async function GET(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    try {
      const userData = await getUserData(session.user.id);

      if (userData.role === "teacher") {
        // Get courses owned by the teacher
        const teacherCourses = await getCoursesOwnedByTeacher(session.user.id);
        const courseIds = teacherCourses.map(course => course._id.toString());

        const announcements = await getAnnouncementsForTeacher(
          session.user.id,
          courseIds
        );

        return NextResponse.json({
          success: true,
          announcements,
        });
      } else {
        const announcements = await getAnnouncementsForStudent(
          session.user.id,
          userData.relatedCourses
        );

        return NextResponse.json({
          success: true,
          announcements,
        });
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      return NextResponse.json(
        { error: "Failed to fetch announcements" },
        { status: 500 }
      );
    }
  })
);
