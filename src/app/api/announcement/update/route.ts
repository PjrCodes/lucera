import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withTeacherSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { UpdateAnnouncementRequestSchema } from "@/lib/schemas/api";
import { updateAnnouncement, getAnnouncementById } from "@/lib/database-service/announcements";
import { getCourseById } from "@/lib/database-service/courses";

export const PUT = auth(
  withTeacherSession(async function PUT(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    try {
      const body = await req.json();
      const parsedBody = UpdateAnnouncementRequestSchema.safeParse(body);

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

      const { _id, title, content, courseId } = parsedBody.data;

      // Validate that the teacher owns the announcement
      const existingAnnouncement = await getAnnouncementById(_id);
      if (existingAnnouncement.createdBy !== session.user.id) {
        return NextResponse.json(
          { error: "You can only edit announcements you created" },
          { status: 403 }
        );
      }

      // Validate that the teacher owns the new course (if course is being changed)
      const course = await getCourseById(courseId);
      if (course.userId !== session.user.id) {
        return NextResponse.json(
          { error: "You can only move announcements to courses you own" },
          { status: 403 }
        );
      }

      const announcement = await updateAnnouncement(
        _id,
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
      console.error("Error updating announcement:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to update announcement" },
        { status: 500 }
      );
    }
  })
);
