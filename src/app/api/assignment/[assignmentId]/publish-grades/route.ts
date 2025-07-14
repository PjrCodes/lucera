import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withAuthorisation } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import client from "@/lib/db";
import { ObjectId } from "mongodb";

export const POST = auth(
  withAuthorisation(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession,
    params: Promise<{ assignmentId: string }>
  ) {
    try {
      const { assignmentId } = await params;

      // Update assignment to mark grades as published
      const result = await client
        .db()
        .collection("assignment")
        .updateOne(
          { _id: new ObjectId(assignmentId) },
          {
            $set: {
              gradesPublished: true,
              gradesPublishedAt: new Date(),
              gradesPublishedBy: session.user.id
            }
          }
        );

      if (result.modifiedCount === 0) {
        return NextResponse.json(
          { error: "Assignment not found or grades already published" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        status: "success",
        message: "Grades published successfully"
      });
    } catch (error) {
      console.error("Error publishing grades:", error);
      return NextResponse.json(
        { error: "Failed to publish grades" },
        { status: 500 }
      );
    }
  })
);
