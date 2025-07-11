import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withAuthorisation } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { isBookmarked } from "@/lib/database-service/bookmarks";

export const GET = auth(
  withAuthorisation(async function GET(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    const url = new URL(req.url!);
    const type = url.searchParams.get("type");
    const relatedId = url.searchParams.get("relatedId");

    if (!type || !relatedId) {
      return NextResponse.json(
        { error: "Missing type or relatedId parameter" },
        { status: 400 },
      );
    }

    if (!["assignment", "content", "course", "poll", "quiz"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid bookmark type" },
        { status: 400 },
      );
    }

    try {
      const bookmarkExists = await isBookmarked(
        session.user.id,
        type as "assignment" | "content" | "course",
        relatedId
      );

      return NextResponse.json({
        success: true,
        isBookmarked: bookmarkExists,
      });
    } catch (error) {
      console.error("Error checking bookmark:", error);
      return NextResponse.json(
        { error: "Failed to check bookmark status" },
        { status: 500 },
      );
    }
  }),
);
