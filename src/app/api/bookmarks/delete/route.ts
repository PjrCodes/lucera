import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withAuthorisation } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { DeleteBookmarkRequestSchema } from "@/lib/schemas/api";
import { deleteBookmark } from "@/lib/database-service/bookmarks";

export const DELETE = auth(
  withAuthorisation(async function DELETE(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    const body = await req.json();
    const parsedBody = DeleteBookmarkRequestSchema.safeParse(body);

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

    const { bookmarkId } = parsedBody.data;

    try {
      await deleteBookmark(session.user.id, bookmarkId);
      return NextResponse.json({
        success: true,
        message: "Bookmark deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 },
        );
      }
      return NextResponse.json(
        { error: "Failed to delete bookmark" },
        { status: 500 },
      );
    }
  }),
);
