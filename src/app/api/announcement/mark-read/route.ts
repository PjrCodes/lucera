import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withStudentSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { MarkAnnouncementReadRequestSchema } from "@/lib/schemas/api";
import { markAnnouncementAsRead } from "@/lib/database-service/announcements";

export const POST = auth(
  withStudentSession(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    try {
      const body = await req.json();
      const parsedBody = MarkAnnouncementReadRequestSchema.safeParse(body);

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

      const { announcementId } = parsedBody.data;

      await markAnnouncementAsRead(announcementId, session.user.id);

      return NextResponse.json({
        success: true,
      });
    } catch (error) {
      console.error("Error marking announcement as read:", error);
      return NextResponse.json(
        { error: "Failed to mark announcement as read" },
        { status: 500 }
      );
    }
  })
);
