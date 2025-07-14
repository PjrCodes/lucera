import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { checkSubmissionExists } from "@/lib/database-service/submitted-assignments";

export const GET = auth(async function GET(
  req: NextAuthRequest,
  ctx: {
    params: Promise<{ assignmentId: string }>;
  }
) {
  if (!req.auth) {
    return NextResponse.json(
      { error: "Unauthorized: No authentication provided" },
      { status: 401 },
    );
  }
  const session = req.auth as AuthenticatedSession;
  if (!session.user || !session.user.id) {
    return NextResponse.json(
      { error: "Unauthorized: No user information found" },
      { status: 401 },
    );
  }

  try {
    const { assignmentId } = await ctx.params;

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 },
      );
    }

    const hasSubmitted = await checkSubmissionExists(
      assignmentId,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      hasSubmitted: hasSubmitted,
    });

  } catch (error) {
    console.error("Error checking submission status:", error);
    return NextResponse.json(
      { error: "Failed to check submission status" },
      { status: 500 },
    );
  }
});
