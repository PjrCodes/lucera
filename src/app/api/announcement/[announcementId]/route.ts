import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withTeacherSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { deleteAnnouncement } from "@/lib/database-service/announcements";

export const DELETE = auth(
  withTeacherSession(async function DELETE(
    req: NextAuthRequest,
    session: AuthenticatedSession,
    params: Promise<{ announcementId: string }>,
  ) {
    try {
      const { announcementId } = await params;

      if (!announcementId) {
        return NextResponse.json(
          { error: "Announcement ID is required" },
          { status: 400 }
        );
      }

      await deleteAnnouncement(announcementId, session.user.id);

      return NextResponse.json({
        success: true,
      });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to delete announcement" },
        { status: 500 }
      );
    }
  })
);
