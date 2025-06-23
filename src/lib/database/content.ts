import { ObjectId } from "mongodb";
import client from "../db";
import { contentSchema } from "../schemas";

export async function getContentById(courseId: string) {
  const course = await client
    .db()
    .collection("content")
    .findOne({ _id: new ObjectId(courseId) });

  if (!course) {
    throw new Error("Course not found");
  }

  try {
    return contentSchema.parse(course);
  } catch (error) {
    console.error("Error parsing content:", error);
    throw new Error("Invalid content data format");
  }
}
