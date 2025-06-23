/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import client from "@/lib/db";
import { redirectUnauthenticated } from "@/lib/auth";
import SetHeaderClientComponent from "@/components/feature/header/set-header-client-component";
import CourseHeader from "@/components/feature/course/cards/course-header";
import { CourseHeaderSkeleton } from "@/components/feature/course/course-skeleton";
import { Course } from "@/lib/schemas";
import { getUserData } from "@/lib/database/auth";
import CourseTabs from "@/components/feature/course/course-tabs";

async function getCourse(course_id: string): Promise<Course | null> {
  const db = client.db();
  const course = await db
    .collection("courses")
    .findOne({ _id: new ObjectId(course_id) });

  if (!course) {
    return null;
  }

  return course as Course | null;
}

export default async function CourseViewPage({
  params,
}: {
  params: { course_id: string };
}) {
  const session = await redirectUnauthenticated();
  if (!session?.user?.id) {
    return notFound();
  }
  const userData = await getUserData(session.user.id);


  let isTeacher = false;
  if (userData.role === "teacher") {
    isTeacher = true;
  } else {
    isTeacher = false;
  }

  const { course_id } = await params;

  const course = await getCourse(course_id);

  if (!course) return notFound();

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


  // Dummy data for assignments, materials, polls, students
  const assignments = [
    {
      id: 1,
      name: "Assignment 1: Basic Concepts",
      due: "2024-02-15",
      status: "pending",
      grade: null,
    },
    {
      id: 2,
      name: "Assignment 2: Data Structures",
      due: "2024-03-01",
      status: "submitted",
      grade: "85%",
    },
    {
      id: 3,
      name: "Mid-term Project",
      due: "2024-03-15",
      status: "graded",
      grade: "92%",
    },
  ];
  const materials = [
    {
      id: 1,
      name: "Course Syllabus.pdf",
      type: "pdf",
      size: "2.3 MB",
      uploadDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Lecture 1 - Introduction.pdf",
      type: "pdf",
      size: "5.1 MB",
      uploadDate: "2024-01-20",
    },
    {
      id: 3,
      name: "Lab Manual.pdf",
      type: "pdf",
      size: "8.7 MB",
      uploadDate: "2024-01-18",
    },
    {
      id: 4,
      name: "Assignment Guidelines.docx",
      type: "doc",
      size: "1.2 MB",
      uploadDate: "2024-01-22",
    },
  ];
  const pollsAndAnnouncements = [
    {
      id: 1,
      type: "poll",
      question: "What's your preferred programming language?",
      responses: 45,
      active: true,
    },
    {
      id: 2,
      type: "poll",
      question: "Rate the difficulty of last week's content",
      responses: 38,
      active: false,
    },
    {
      id: 3,
      type: "announcement",
      question: "Class cancelled tomorrow due to holiday",
      responses: null,
      active: false,
    },
    {
      id: 4,
      type: "announcement",
      question: "New assignment uploaded - check materials section",
      responses: null,
      active: false,
    },
  ];
  const students: string[] = [];
  const grades: string[] = [];

  const isBookmarked = false;

  return (
    <>
      <SetHeaderClientComponent title={course.name.toUpperCase()} />
      <div className="min-h-screen bg-primary-50">
        <div className="max-w-5xl mx-auto p-6">
          <CourseHeader course={course} isTeacher={isTeacher} isBookmarked={isBookmarked} />
          <div className="mt-6">
            <CourseTabs
              course={course}
              assignments={assignments}
              materials={materials}
              pollsAndAnnouncements={pollsAndAnnouncements}
              students={students}
              grades={grades}
            />
          </div>
        </div>
      </div>
    </>
  );
}
