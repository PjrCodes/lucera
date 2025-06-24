import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import client from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { getUserData } from "@/lib/database/auth";
import { fileSchema } from "@/lib/schemas";

export const POST = auth(async function POST(req: NextAuthRequest) {
  try {
    if (!req.auth || !req.auth.user || !req.auth.user.id) {
      return NextResponse.json(
        { status: "failed", error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userData = await getUserData(req.auth.user.id);

    if (!userData) {
      return NextResponse.json(
        {
          status: "failed",
          error: "Internal Server Error: User data not found",
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const content_type = formData.get("content_type") as string;
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { status: "failed", error: "No file provided or invalid file type" },
        { status: 400 }
      );
    }
    // file type pdf
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { status: "failed", error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }
    if (!content_type || typeof content_type !== "string") {
      return NextResponse.json(
        { status: "failed", error: "Invalid or missing type parameter" },
        { status: 400 }
      );
    }
    const isTeacher = userData.role === "teacher";
    if (
      !isTeacher &&
      (content_type === "syllabus" || content_type === "content")
    ) {
      return NextResponse.json(
        { status: "failed", error: "Only teachers can upload syllabus files" },
        { status: 403 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    try {
      await fs.writeFile(`./data/uploads/${file.name}`, buffer);
    } catch (e) {
      console.error("Error writing file:", e);
      return NextResponse.json(
        { status: "failed", error: "Failed to write file to disk" },
        { status: 500 }
      );
    }

    // Validate file using the schema
    const parsedFile = fileSchema.safeParse({
      name: file.name,
      size: file.size,
      file_type: file.type,
      path: `./data/uploads/${file.name}`,
      userId: req.auth.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: content_type,
    });

    // post file upload, create the database entry
    const db = client.db();
    const collection = db.collection("files");
    try {
      if (!parsedFile.success) {
        return NextResponse.json(
          { status: "failed", error: parsedFile.error?.message || "Invalid file data" },
          { status: 400 }
        );
      }

      const insertedObject = await collection.insertOne(parsedFile.data);

      if (!insertedObject.acknowledged) {
        return NextResponse.json(
          { status: "failed", error: "Failed to insert file record" },
          { status: 500 }
        );
      }

      console.log("File uploaded and record created:", insertedObject);
      return NextResponse.json(
        { status: "success", fileId: insertedObject.insertedId.toString() },
        { status: 200 }
      );
    } catch (e) {
      console.error("Error inserting file record into database:", e);
      return NextResponse.json(
        {
          status: "failed",
          error: "Failed to insert file record into database",
        },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "failed", error: e }, { status: 500 });
  }
});
