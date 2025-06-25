import { NextResponse } from "next/server";
import fs from "fs/promises";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import client from "@/lib/db";

import { LLMContentExtractor } from "@/lib/llm/content";
import { getFileRecord } from "@/lib/database-service/files";
import { getCourseById } from "@/lib/database-service/courses";
import { MagicCreateContentRequestSchema } from "@/lib/schemas/api";
import { withTeacherSession } from "@/lib/database-service/auth";
import { generateErrorMessage } from "zod-error";

export const POST = auth(
  withTeacherSession(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession
  ) {
    const body = await req.json();
    const parsedBody = MagicCreateContentRequestSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: generateErrorMessage(parsedBody.error.issues) },
        { status: 400 }
      );
    }
    const { fileId, courseId } = parsedBody.data;

    // query from the database to get the file path
    let fileRecord;
    try {
      fileRecord = await getFileRecord(fileId, session.user.id);
    } catch {
      return NextResponse.json(
        { error: "One of several errors." },
        { status: 500 }
      );
    }
    const filePath = fileRecord.path;
    // ensure the file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return NextResponse.json(
        { error: "File does not exist", detailedError: error },
        { status: 404 }
      );
    }

    // const allText = await readPdfText(filePath);

    // Call LLM parse apis with error handling
    let title, description;
    let topics: number[] = [];

    const courseRecord = await getCourseById(courseId);

    const llmResult = await LLMContentExtractor(filePath, courseRecord);
    if (!llmResult.success || !llmResult.data) {
      title = "Enter Course Title";
      description =
        "Course description could not be automatically generated. Please edit this course to add details.";
      topics = [];
    } else {
      title = llmResult.data.title;
      description = llmResult.data.description;
      topics = llmResult.data.topics;
    }

    const db = client.db();
    const contentRecord = await db.collection("content").insertOne({
      courseId: courseId,
      title: title,
      description: description,
      topics: topics,
      fileId: fileId,
      createdBy: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!contentRecord.acknowledged) {
      return NextResponse.json(
        { error: "Failed to create content record" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      contentId: contentRecord.insertedId.toString(),
      message: "Content created successfully",
      status: "success",
    });
  })
);
