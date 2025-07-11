import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withAuthorisation } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { getBookmarks } from "@/lib/database-service/bookmarks";

export const GET = auth(
  withAuthorisation(async function GET(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    try {
      const bookmarks = await getBookmarks(session.user.id);
      return NextResponse.json({
        success: true,
        bookmarks,
      });
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookmarks" },
        { status: 500 },
      );
    }
  }),
);
