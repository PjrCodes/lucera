import { NextResponse } from "next/server";
import fs from "fs/promises";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import client from "@/lib/db";

import { LLMContentParse } from "@/lib/llm/content";
import { checkTeacherhood } from "@/lib/database/auth";
import { getFileRecord } from "@/lib/database/files";

import { z } from "zod";
import { getCourseById } from "@/lib/database/courses";

const schema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  courseId: z.string().min(1, "Course ID is required"),
});

// Example: Parse a course file and create a course object
export const POST = auth(async function POST(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const session = req.auth;
  if (!session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!(await checkTeacherhood(session.user.id))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error processing User Data" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const parsedBody = schema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.message },
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
    let title, shortDescription, description;
    let topics: number[] = [];

    const courseRecord = await getCourseById(courseId);
    try {
      const llmResult = await LLMContentParse(filePath, courseRecord);
      title = llmResult.title;
      shortDescription = llmResult.shortDescription;
      description = llmResult.description;
      topics = llmResult.topics;
    } catch (llmError) {
      console.error("LLM parsing failed:", llmError);
      // Fallback values when LLM parsing fails
      title = "Enter Course Title";
      description = "Course description could not be automatically generated. Please edit this course to add details.";
      shortDescription = "";
      topics = [];
    }
    const db = client.db();
    const contentRecord = await db.collection("content").insertOne({
      courseId: courseId,
      title: title,
      description: description,
      shortDescription: shortDescription,
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
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
});
