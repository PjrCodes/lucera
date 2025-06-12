/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import client from "@/lib/db";
import { redirectUnauthenticated } from "@/auth";
import SetHeaderClientComponent from "@/components/SetHeaderClientComponent";
import CourseHeader from "@/components/course/CourseHeader";
import CourseDescription from "@/components/course/CourseDescription";
import CourseUnits from "@/components/course/CourseUnits";
import CourseTimeline from "@/components/course/CourseTimeline";
import CourseSidebar from "@/components/course/CourseSidebar";
import { CourseHeaderSkeleton, CourseDescriptionSkeleton, CourseUnitsSkeleton, CourseTimelineSkeleton } from "@/components/course-skeleton";

export interface CourseUnit {
  name: string;
  description?: string;
}

export interface TimelineItem {
  type: string;
  title: string;
  start_date: string;
  due_date: string;
  grade_release_date: string;
  start_date_inferred?: boolean;
  due_date_inferred?: boolean;
  grade_release_date_inferred?: boolean;
}

export interface Course {
  _id: string;
  name: string;
  short_description?: string;
  description: string;
  units?: CourseUnit[];
  timeline?: TimelineItem[];
  [key: string]: unknown;
}

async function getCourse(course_id: string): Promise<Course | null> {
  const db = client.db();
  const course = await db
    .collection("courses")
    .findOne({ _id: new ObjectId(course_id) });
  
  if (process.env.NODE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return course as Course | null;
}

export default async function CourseViewPage({
  params,
}: {
  params: { course_id: string };
}) {
  const session = await redirectUnauthenticated();
  const { course_id } = await params;
  
  const course = await getCourse(course_id);
  if (!course) return notFound();

  return (
    <>
      <SetHeaderClientComponent title={course.name.toUpperCase()} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content - Left Side */}
            <div className="flex-1 space-y-6">
              <Suspense fallback={<CourseHeaderSkeleton />}>
                <CourseHeader course={course} />
              </Suspense>
              
              <Suspense fallback={<CourseDescriptionSkeleton />}>
                <CourseDescription course={course} />
              </Suspense>
              
              <Suspense fallback={<CourseUnitsSkeleton />}>
                <CourseUnits course={course} />
              </Suspense>
              
              <Suspense fallback={<CourseTimelineSkeleton />}>
                <CourseTimeline course={course} />
              </Suspense>
            </div>

            {/* Sidebar - Right Side */}
            <div className="lg:w-80">
              <CourseSidebar course={course} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
