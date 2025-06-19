import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import client from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { getUserData } from "@/lib/database/auth";
import { CustomFile, fileSchema } from "@/lib/schemas";

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
    const type = formData.get("type") as string;
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
    if (!type || typeof type !== "string") {
      return NextResponse.json(
        { status: "failed", error: "Invalid or missing type parameter" },
        { status: 400 }
      );
    }
    const isTeacher = userData.role === "teacher";
    if (!isTeacher && (type === "syllabus" || type === "content")) {
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
      lastModified: new Date(),
      type: type,
    });

    // post file upload, create the database entry
    const db = client.db();
    const collection = db.collection("files");
    const insertedObject = await collection.insertOne(
      parsedFile.data as CustomFile
    );

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
    console.error(e);
    return NextResponse.json({ status: "failed", error: e }, { status: 500 });
  }
});
