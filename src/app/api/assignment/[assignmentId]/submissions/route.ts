import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withTeacherSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { getSubmissionsForAssignment } from "@/lib/database-service/submitted-assignments";

export const GET = auth(
  withTeacherSession(async function GET(
    req: NextAuthRequest,
    session: AuthenticatedSession,
    params: Promise<{ assignmentId: string }>,
  ) {
    try {
      const { assignmentId } = await params;
      console.log("Fetching submissions for assignment:", assignmentId);
      if (!assignmentId) {
        return NextResponse.json(
          { error: "Assignment ID is required" },
          { status: 400 },
        );
      }

      const submissions = await getSubmissionsForAssignment(assignmentId);
      console.log("Submissions fetched:", submissions.length);
      return NextResponse.json({
        success: true,
        submissions: submissions,
      });

    } catch (error) {
      console.error("Error fetching submissions:", error);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 },
      );
    }
  }),
);
