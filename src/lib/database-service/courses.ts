import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { getUserData } from "./auth";
import { Course, courseSchema, userWithDataSchema } from "../schemas/database";

export async function getCoursesForUser(userId: string) {
  const userData = await getUserData(userId);

  // Extract related course IDs from user data
  const relatedCourseIDs = userData.relatedCourses.map(
    (course) => new ObjectId(course),
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

export async function getCourseById(courseId: string) {
  const course = await client
    .db()
    .collection("courses")
    .findOne({ _id: new ObjectId(courseId) });

  if (!course) {
    throw new Error("Course not found");
  }

  try {
    return courseSchema.parse(course);
  } catch (error) {
    console.error("Error parsing course:", error);
    throw new Error("Invalid course data format");
  }
}

export async function getStudentsForCourse(courseId: string) {
  const userDataCollection = client.db().collection("users_and_their_data");
  const students = await userDataCollection
    .find({
      relatedCourses: {
        $in: [courseId],
      },
      role: "student",
    })
    .toArray();

  try {
    return students.map((student) => userWithDataSchema.parse(student));
  } catch (error) {
    console.error("Error parsing students:", error);
    throw new Error("Invalid user data format found in database");
  }
}

export async function getAvailableStudents(
  course_id: string,
): Promise<{ id: string; name: string; email: string }[]> {
  const result = await client
    .db()
    .collection("users_and_their_data")
    .find({
      relatedCourses: { $nin: [course_id] },
      role: "student",
    })
    .toArray()
    .then((students) => {
      // This is where you would process the students data
      console.log("Available students for course:", course_id, students);
      return students.map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
      }));
    })
    .catch((error) => {
      console.error("Error fetching available students:", error);
      throw new Error("Failed to fetch available students");
    });
  return result;
}
