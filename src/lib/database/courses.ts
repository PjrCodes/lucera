import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { getUserData } from "./auth";
import { Course, courseSchema } from "../schemas";

export async function getCoursesForUser(userId: string) {

  const userData = await getUserData(userId);

  // Extract related course IDs from user data
  const relatedCourseIDs = userData.relatedCourses.map(
    (course) => new ObjectId(course)
  );

  const coursesData = client
    .db()
    .collection("courses")
    .find({
      _id: { $in: relatedCourseIDs },
    })
    .sort({ createdAt: -1 }); // Sort by creation date, most recent first

  const rawCourses = await coursesData.toArray();
  let courses: Course[] = [];
  try {
    courses = rawCourses.map((course) => courseSchema.parse(course));
  } catch (error) {
    console.error("Error parsing courses:", error);
    throw new Error("Invalid course data format");
  }

  return courses;
}
