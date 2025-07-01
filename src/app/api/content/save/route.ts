import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import client from "@/lib/db";
import { withTeacherSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { SaveContentRequestSchema } from "@/lib/schemas/api";
import { ObjectId } from "mongodb";

export const POST = auth(
  withTeacherSession(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession
  ) {
    const body = await req.json();
    console.log(body);
    const parsedBody = SaveContentRequestSchema.safeParse(body);
    if (!parsedBody.success) {
      console.log("Validation failed:", parsedBody.error);
      return NextResponse.json(
        {
          error: parsedBody.error.issues
            .map((issue) => issue.message)
            .join(", "),
        },
        { status: 400 }
      );
    }

    const db = client.db();
    const contentCollection = db.collection("content");

    const isNewContent = !parsedBody.data._id;

    let contentRecord;
    let contentId: string;

    if (isNewContent) {
      // Create new content
      const newContentData = {
        title: parsedBody.data.data.title,
        description: parsedBody.data.data.description,
        courseId: parsedBody.data.data.courseId,
        topics: parsedBody.data.data.topics,
        fileId: parsedBody.data.data.fileId || null,
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "draft",
        llmParsingFailed: false,
      };

      contentRecord = await contentCollection.insertOne(newContentData);

      if (!contentRecord.acknowledged) {
        return NextResponse.json(
          { error: "Failed to create content record" },
          { status: 500 }
        );
      }

      contentId = contentRecord.insertedId.toString();
    } else {
      // Update existing content
      if (!parsedBody.data._id) {
        return NextResponse.json(
          { error: "Content ID is required for update" },
          { status: 400 }
        );
      }

      const updateFields: Record<string, unknown> = {};
      const fieldsToUpdate = [
        "title",
        "description",
        "courseId",
        "topics",
        "fileId",
      ];

      for (const field of fieldsToUpdate) {
        const value =
          parsedBody.data.data[field as keyof typeof parsedBody.data.data];
        if (value !== null && value !== undefined) {
          updateFields[field] = value;
        }
      }
      updateFields.status = "published";
      updateFields.updatedAt = new Date();

      contentRecord = await contentCollection.updateOne(
        { _id: new ObjectId(parsedBody.data._id) },
        {
          $set: updateFields,
        }
      );

      if (!contentRecord.acknowledged) {
        return NextResponse.json(
          { error: "Failed to update content record" },
          { status: 500 }
        );
      }

      contentId =
        parsedBody.data._id || contentRecord.upsertedId?.toString() || "";
    }

    // Add the content to the user's related content array (if needed)
    const userCollection = db.collection("user_data");
    const userUpdateResult = await userCollection.updateOne(
      { id: session.user.id },
      { $addToSet: { relatedContent: contentId } }
    );
    if (
      userUpdateResult.modifiedCount === 0 &&
      userUpdateResult.matchedCount === 0
    ) {
      return NextResponse.json(
        { error: "Failed to update user relatedContent" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contentId,
      created: isNewContent,
    });
  })
);
