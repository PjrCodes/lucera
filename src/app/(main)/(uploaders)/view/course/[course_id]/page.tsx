import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import client from "@/lib/db";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import SetHeaderClientComponent from "@/components/feature/header/set-header-client-component";
import CourseHeader from "@/components/feature/course/cards/course-header";
import { Course, UserWithData } from "@/lib/schemas/database";
import CourseTabs from "@/components/feature/course/course-tabs";
import { getContentForCourse } from "@/lib/database-service/content";
import {
  getAvailableStudents,
  getStudentsForCourse,
} from "@/lib/database-service/courses";
import { getAssignmentsForCourse } from "@/lib/database-service/assignment";
import { isBookmarked as checkIfBookmarked } from "@/lib/database-service/bookmarks";

async function getCourse(course_id: string): Promise<Course | null> {
  const db = client.db();
  try {
    const course = await db
      .collection("courses")
      .findOne({ _id: new ObjectId(course_id) });
    if (!course) {
      return null;
    }
    return course as Course | null;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
}

export default async function CourseViewPage({
  params,
}: {
  params: Promise<{ course_id: string }>;
}) {
  const { session, userData } = await getSessionAndUserData();
  const isTeacher = userData.role === "teacher";

  const { course_id } = await params;

  const course = await getCourse(course_id);

  // console.log("course found");
  if (!course) return notFound();
  // console.log("course success");
  // check access restriction on course
  if (
    !userData.relatedCourses?.some((id: string) => id === course._id.toString())
  ) {
    return notFound();
  }
  // check if course is published
  if (userData.role === "student" && !(course.status === "published")) {
    return notFound();
  }
  if (course?._id instanceof ObjectId) {
    course._id = course._id.toString();
  }

  // Fetch assignments for the course
  const assignments = await getAssignmentsForCourse(course._id.toString());

  const students: UserWithData[] = await getStudentsForCourse(
    course._id.toString(),
  );

  // Get available students for invitation (only for teachers)
  const availableStudents = isTeacher
    ? await getAvailableStudents(course._id.toString())
    : [];

  const isBookmarked = await checkIfBookmarked(
    session.user.id,
    "course",
    course._id.toString()
  );

  const courseMaterialsData = (
    await getContentForCourse(course._id.toString())
  ).map((content) => ({
    ...content,
    _id: content._id.toString(),
    file: {
      ...content.file,
      _id: content.file._id?.toString(),
    },
  }));

  const safeCourse = {
    ...course,
    _id: course._id.toString(),
  };
  console.log(safeCourse);
  const safeStudents = students.map((student) => ({
    ...student,
    _id: student._id.toString(),
  }));
  const safeAssignments = assignments.map((assignment) => ({
    ...assignment,
    _id: assignment._id.toString(),
    file: {
      ...assignment.file,
      _id: assignment.file._id?.toString(),
    },
  }));
  return (
    <>
      <SetHeaderClientComponent title={course.name.toUpperCase()} />
      <div className="min-h-screen bg-primary-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mx-auto w-full">
            <CourseHeader
              course={safeCourse}
              isTeacher={isTeacher}
              isBookmarked={isBookmarked}
            />
          </div>
          <div className="mx-auto mt-6 w-full">
            <CourseTabs
              course={safeCourse}
              assignments={safeAssignments}
              courseMaterialsData={courseMaterialsData}
              students={safeStudents}
              courseId={course._id.toString()}
              isTeacher={isTeacher}
              availableStudents={availableStudents}
            />
          </div>
        </div>
      </div>
    </>
  );
}
