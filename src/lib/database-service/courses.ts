import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { getUserData } from "./auth";
import {
  Course,
  courseSchema,
  courseWithEmbeddedSyllabusSchema,
  userWithDataSchema,
} from "../schemas/database";
import { getFileRecord } from "./files";

export async function deleteCourseById(
  courseId: string,
  userId: string
): Promise<void> {
  const courseObjectId = new ObjectId(courseId);

  // Delete the course from the courses collection
  await client
    .db()
    .collection("courses")
    .deleteOne({ _id: courseObjectId, userId: userId });

  await client
    .db()
    .collection("user_data")
    .updateMany(
      { relatedCourses: courseId },
      { $pull: { relatedCourses: courseId } }
    );

  return;
}

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

export async function getCourseAndSyllabusById(courseId: string) {
  const course = await getCourseById(courseId);
  if (!course) {
    throw new Error("Course does not have a syllabus file");
  }
  const syllabusFileId = course.syllabusFileId;
  const file = await getFileRecord(syllabusFileId ?? "");
  if (!file) {
    throw new Error("Syllabus file not found");
  }
  try {
    return courseWithEmbeddedSyllabusSchema.parse({
      ...course,
      syllabusFile: file,
    });
  } catch (error) {
    console.error("Error parsing course with syllabus:", error);
    throw new Error("Invalid course data format with syllabus");
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
  course_id: string
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
