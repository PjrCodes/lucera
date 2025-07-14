import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withAuthorisation } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { getAssignmentById } from "@/lib/database-service/assignment";

export const GET = auth(
  withAuthorisation(async function GET(
    req: NextAuthRequest,
    session: AuthenticatedSession,
    params: Promise<{ assignmentId: string }>
  ) {
    try {
      const { assignmentId } = await params;

      const assignment = await getAssignmentById(assignmentId);

      return NextResponse.json({
        status: "success",
        assignment: assignment
      });
    } catch (error) {
      console.error("Error fetching assignment:", error);
      return NextResponse.json(
        { error: "Failed to fetch assignment" },
        { status: 500 }
      );
    }
  })
);
