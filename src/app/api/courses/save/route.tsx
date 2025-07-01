import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import client from "@/lib/db";
import { withTeacherSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { SaveCourseRequestSchema } from "@/lib/schemas/api";
import { ObjectId } from "mongodb";

export const POST = auth(
  withTeacherSession(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession
  ) {
    const body = await req.json();
    console.log(body);
    const parsedBody = SaveCourseRequestSchema.safeParse(body);
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
    const courseCollection = db.collection("courses");

    const isNewCourse = !parsedBody.data._id;

    let courseRecord;
    let courseId: string;

    if (isNewCourse) {
      // Create new course
      const newCourseData = {
        name: parsedBody.data.data.name,
        courseCode: parsedBody.data.data.courseCode,
        courseStartDate: parsedBody.data.data.courseStartDate,
        courseEndDate: parsedBody.data.data.courseEndDate,
        description: parsedBody.data.data.description,
        shortDescription: parsedBody.data.data.shortDescription,
        // syllabusFileId: parsedBody.data.data.syllabusFileId,
        units: parsedBody.data.data.units,
        timeline: parsedBody.data.data.timeline,
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        coverImage: null,
        status: "draft",
        llmParsingFailed: false,
        enrolledStudentCount: 0,
        completedStudentCount: 0,
      };

      courseRecord = await courseCollection.insertOne(newCourseData);

      if (!courseRecord.acknowledged) {
        return NextResponse.json(
          { error: "Failed to create course record" },
          { status: 500 }
        );
      }

      courseId = courseRecord.insertedId.toString();
    } else {
      // Update existing course
      if (!parsedBody.data._id) {
        return NextResponse.json(
          { error: "Course ID is required for update" },
          { status: 400 }
        );
      }
      // Only update fields if the new value is not null
      const updateFields: Record<string, unknown> = {};
      const fieldsToUpdate = [
        "name",
        "courseCode",
        "courseStartDate",
        "courseEndDate",
        "description",
        "shortDescription",
        "units",
        "timeline",
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

      courseRecord = await courseCollection.updateOne(
        { _id: new ObjectId(parsedBody.data._id) },
        {
          $set: updateFields,
        }
      );

      if (!courseRecord.acknowledged) {
        return NextResponse.json(
          { error: "Failed to update course record" },
          { status: 500 }
        );
      }

      courseId =
        parsedBody.data._id || courseRecord.upsertedId?.toString() || "";
    }

    // add the course to the user's relatedCourses array (only for new courses)
    // if (isNewCourse) {
    const userCollection = db.collection("user_data");
    const userUpdateResult = await userCollection.updateOne(
      { id: session.user.id },
      { $addToSet: { relatedCourses: courseId } }
    );
    if (
      userUpdateResult.modifiedCount === 0 &&
      userUpdateResult.matchedCount === 0
    ) {
      return NextResponse.json(
        { error: "Failed to update user relatedCourses" },
        { status: 500 }
      );
    }
    // }

    return NextResponse.json({
      success: true,
      courseId,
      created: isNewCourse,
    });
  })
);
