import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import client from "@/lib/db";

import { LLMContentExtractor } from "@/lib/llm/content";
import { loadFileFromDiskById } from "@/lib/database-service/files";
import { getCourseById } from "@/lib/database-service/courses";
import { MagicCreateContentRequestSchema } from "@/lib/schemas/api";
import { withTeacherSession } from "@/lib/database-service/auth";
import { addCourseContent } from "@/lib/pinecone";
import { PdfReader } from "pdfreader";

function parsePdfFile(filePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const items: string[] = [];
    new PdfReader().parseFileItems(filePath, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item) {
        resolve(items);
      } else if (item.text) {
        items.push(item.text);
      }
    });
  });
}

export const POST = auth(
  withTeacherSession(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession
  ) {
    const body = await req.json();
    console.log("Magic Create Content Request Body:", body);
    const parsedBody = MagicCreateContentRequestSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: parsedBody.error.issues
            .map((issue) => issue.message)
            .join(", "),
        },
        { status: 400 }
      );
    }
    const { fileId, courseId } = parsedBody.data;

    // query from the database to get the file path
    const loadResponse = await loadFileFromDiskById(fileId, session.user.id);
    if (loadResponse.error) {
      return loadResponse.error;
    }

    // extract text from the PDF file
    let extractedTextArray: string[] = [];
    try {
      extractedTextArray = await parsePdfFile(loadResponse.fullPath);
    } catch (error) {
      console.error(
        "[LLM_CONTENT_EXTRACTOR]: Error extracting text from PDF:",
        error
      );
      return NextResponse.json(
        {
          error:
            "Failed to extract text from PDF file. Please ensure the file is a valid PDF and try again.",
        },
        { status: 500 }
      );
    }
    const extractedText = extractedTextArray.join("\n");
    // Call LLM parse apis with error handling
    const courseRecord = await getCourseById(courseId);

    const llmResult = await LLMContentExtractor(
      loadResponse.fileBuffer,
      courseRecord
    );

    const {
      title = "Enter Course Title",
      description = "Course description could not be automatically generated. Please edit this course to add details.",
      topics = [],
    } = llmResult.success ? llmResult.data : {};

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
      type: "content",
      extractedText: extractedText,
    });

    if (!contentRecord.acknowledged) {
      return NextResponse.json(
        { error: "Failed to create content record" },
        { status: 500 }
      );
    }

    try {
      await addCourseContent(
        contentRecord.insertedId.toString(),
        description,
        "course_material",
        courseId ? courseId.toString() : null
      );
    } catch (error) {
      console.error(
        "[LLM_CONTENT_EXTRACTOR]: Error adding document to Pinecone:",
        error
      );
      return NextResponse.json(
        {
          error:
            "Failed to add content to Pinecone - content cannot be used for chat bot operations",
        },
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
