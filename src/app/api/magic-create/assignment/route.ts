import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import client from "@/lib/db";

import { loadFileFromDiskById } from "@/lib/database-service/files";
import { getCourseById } from "@/lib/database-service/courses";
import { MagicCreateAssignmentRequestSchema } from "@/lib/schemas/api";
import { withTeacherSession } from "@/lib/database-service/auth";
import { LLMAssignmentExtractor } from "@/lib/llm/assignment";

export const POST = auth(
  withTeacherSession(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    const body = await req.json();
    const parsedBody = MagicCreateAssignmentRequestSchema.safeParse(body);
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
    const { fileId, courseId } = parsedBody.data;

    // query from the database to get the file path
    const loadResponse = await loadFileFromDiskById(fileId, session.user.id);
    if (loadResponse.error) {
      return loadResponse.error;
    }

    // Call LLM parse apis with error handling
    const courseRecord = await getCourseById(courseId);

    const llmResult = await LLMAssignmentExtractor(
      loadResponse.fileBuffer,
      courseRecord,
    );

    const {
      title = "Enter Assignment Title",
      description = "Assignment description could not be automatically generated. Please edit this assignment to add details.",
      topics = [],
      startDate = null,
      dueDate = null,
      gradeReleaseDate = null,
      submissionType = "file_upload",
      grading = {
        rubric: {
          criteria: [],
          levels: [],
        },
        type: "percentage",
        method: "direct",
        total_points: 100,
      },
    } = llmResult.success ? llmResult.data : {};

    const db = client.db();
    const contentRecord = await db.collection("assignment").insertOne({
      courseId: courseId,
      title: title,
      description: description,
      topics: topics,
      fileId: fileId,
      createdBy: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      startDate: startDate,
      dueDate: dueDate,
      gradeReleaseDate: gradeReleaseDate,
      submissionType: submissionType,
      grading: grading,
    });

    if (!contentRecord.acknowledged) {
      return NextResponse.json(
        { error: "Failed to create assignment record" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      contentId: contentRecord.insertedId.toString(),
      message: "Assignment created successfully",
      status: "success",
    });
  }),
);
