import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withAuthorisation } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { getSubmissionsForStudent } from "@/lib/database-service/submitted-assignments";

export const GET = auth(
  withAuthorisation(async function GET(
    req: NextAuthRequest,
    session: AuthenticatedSession
  ) {
    try {
      const { searchParams } = new URL(req.url);
      const courseId = searchParams.get("courseId");

      const submissions = await getSubmissionsForStudent(
        session.user.id,
        courseId || undefined
      );

      return NextResponse.json({
        status: "success",
        submissions
      });
    } catch (error) {
      console.error("Error fetching student grades:", error);
      return NextResponse.json(
        { error: "Failed to fetch grades" },
        { status: 500 }
      );
    }
  })
);
