import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import client from "@/lib/db";
import { withTeacherSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { SaveAssignmentRequestSchema } from "@/lib/schemas/api";
import { ObjectId } from "mongodb";

export const POST = auth(
  withTeacherSession(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession
  ) {
    const body = await req.json();
    console.log(body);
    const parsedBody = SaveAssignmentRequestSchema.safeParse(body);
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
    const assignmentCollection = db.collection("assignment");

    const isNewAssignment = !parsedBody.data._id;

    let assignmentRecord;
    let assignmentId: string;

    if (isNewAssignment) {
      // Create new assignment
      const newAssignmentData = {
        title: parsedBody.data.data.title,
        description: parsedBody.data.data.description,
        courseId: parsedBody.data.data.courseId,
        topics: parsedBody.data.data.topics,
        fileId: parsedBody.data.data.fileId || null,
        startDate: parsedBody.data.data.startDate,
        dueDate: parsedBody.data.data.dueDate,
        gradeReleaseDate: parsedBody.data.data.gradeReleaseDate,
        submissionType: parsedBody.data.data.submissionType,
        grading: parsedBody.data.data.grading,
        createdBy: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "draft",
      };

      assignmentRecord = await assignmentCollection.insertOne(newAssignmentData);

      if (!assignmentRecord.acknowledged) {
        return NextResponse.json(
          { error: "Failed to create assignment record" },
          { status: 500 }
        );
      }

      assignmentId = assignmentRecord.insertedId.toString();
    } else {
      // Update existing assignment
      if (!parsedBody.data._id) {
        return NextResponse.json(
          { error: "Assignment ID is required for update" },
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
        "startDate",
        "dueDate",
        "gradeReleaseDate",
        "submissionType",
        "grading",
      ];

      for (const field of fieldsToUpdate) {
        const value = parsedBody.data.data[field as keyof typeof parsedBody.data.data];
        if (value !== null && value !== undefined) {
          updateFields[field] = value;
        }
      }
      updateFields.status = "published";
      updateFields.updatedAt = new Date();

      assignmentRecord = await assignmentCollection.updateOne(
        { _id: new ObjectId(parsedBody.data._id) },
        {
          $set: updateFields,
        }
      );

      if (!assignmentRecord.acknowledged) {
        return NextResponse.json(
          { error: "Failed to update assignment record" },
          { status: 500 }
        );
      }

      assignmentId = parsedBody.data._id || assignmentRecord.upsertedId?.toString() || "";
    }

    // Add the assignment to the user's related content array
    const userCollection = db.collection("user_data");
    const userUpdateResult = await userCollection.updateOne(
      { id: session.user.id },
      { $addToSet: { relatedContent: assignmentId } }
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
      assignmentId,
      created: isNewAssignment,
    });
  })
);
