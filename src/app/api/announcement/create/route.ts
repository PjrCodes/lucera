import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withTeacherSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { CreateAnnouncementRequestSchema } from "@/lib/schemas/api";
import { createAnnouncement } from "@/lib/database-service/announcements";
import { getCourseById } from "@/lib/database-service/courses";

export const POST = auth(
  withTeacherSession(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    try {
      const body = await req.json();
      const parsedBody = CreateAnnouncementRequestSchema.safeParse(body);

      if (!parsedBody.success) {
        return NextResponse.json(
          {
            error: parsedBody.error.issues
              .map((issue) => issue.message)
              .join(", "),
          },
          { status: 400 },
        );
      }

      const { title, content, courseId } = parsedBody.data;

      // Validate that the teacher owns the course
      const course = await getCourseById(courseId);
      if (course.userId !== session.user.id) {
        return NextResponse.json(
          { error: "You can only create announcements for courses you own" },
          { status: 403 }
        );
      }

      const announcement = await createAnnouncement(
        title,
        content,
        courseId,
        session.user.id
      );

      return NextResponse.json({
        success: true,
        announcement,
      });
    } catch (error) {
      console.error("Error creating announcement:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to create announcement" },
        { status: 500 }
      );
    }
  })
);
