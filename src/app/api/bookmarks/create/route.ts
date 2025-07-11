import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withAuthorisation } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { CreateBookmarkRequestSchema } from "@/lib/schemas/api";
import { createBookmark } from "@/lib/database-service/bookmarks";

export const POST = auth(
  withAuthorisation(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    const body = await req.json();
    const parsedBody = CreateBookmarkRequestSchema.safeParse(body);

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

    const { type, relatedId } = parsedBody.data;

    try {
      const bookmark = await createBookmark(session.user.id, type, relatedId);
      return NextResponse.json({
        success: true,
        bookmark,
      });
    } catch (error) {
      console.error("Error creating bookmark:", error);
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 },
        );
      }
      return NextResponse.json(
        { error: "Failed to create bookmark" },
        { status: 500 },
      );
    }
  }),
);
