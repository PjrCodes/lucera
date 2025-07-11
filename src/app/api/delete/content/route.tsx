import { auth } from "@/lib/auth";
import { withTeacherSession } from "@/lib/database-service/auth";
import { deleteContentById } from "@/lib/database-service/content";
import { AuthenticatedSession } from "@/lib/types/auth";
import { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const deleteContentRequestSchema = z.object({
  contentId: z.string().refine((val) => val.length > 0, {
    message: "Content ID is required",
  }),
});

export const DELETE = auth(
  withTeacherSession(async function DELETE(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    const body = await req.json();
    const parsedBody = deleteContentRequestSchema.safeParse(body);

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

    const { contentId } = parsedBody.data;
    console.log(
      `Request to delete content with ID: ${contentId} by user: ${session.user.id}`,
    );

    try {
      await deleteContentById(contentId);
    } catch (error) {
      if (!(error instanceof Error)) {
        return NextResponse.json(
          { error: "Request Blocked for unknown reason" },
          { status: 500 },
        );
      }
      console.error("Error deleting content:", error);
      return NextResponse.json(
        { error: "Request Blocked: " + error.message },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { message: "Content deleted successfully" },
      { status: 200 },
    );
  }),
);
