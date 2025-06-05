/* eslint-disable @typescript-eslint/no-unused-vars */
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import client from "@/lib/db";
import { redirectUnauthenticated } from "@/auth";
import { MyMarkdown } from "@/components/markdown";
import { CoursePageSkeleton, CourseHeaderSkeleton, CourseDescriptionSkeleton, CourseUnitsSkeleton, CourseTimelineSkeleton } from "@/components/course-skeleton";

interface CourseUnit {
  name: string;
  description?: string;
}

interface TimelineItem {
  type: string;
  title: string;
  start_date: string;
  due_date: string;
  grade_release_date: string;
  start_date_inferred?: boolean;
  due_date_inferred?: boolean;
  grade_release_date_inferred?: boolean;
}

interface Course {
  _id: string;
  name: string;
  short_description?: string;
  description: string;
  units?: CourseUnit[];
  timeline?: TimelineItem[];
  [key: string]: unknown; // Allow other MongoDB fields
}

async function getCourse(course_id: string): Promise<Course | null> {
  const db = client.db();
  const course = await db
    .collection("courses")
    .findOne({ _id: new ObjectId(course_id) });
  
  // Add a small delay to demonstrate loading states in development
  if (process.env.NODE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return course as Course | null;
}

async function getCourseHeader(course_id: string): Promise<Course | null> {
  // Fast query for just basic course info
  const db = client.db();
  const course = await db
    .collection("courses")
    .findOne({ _id: new ObjectId(course_id) }, { 
      projection: { name: 1, short_description: 1 } 
    });
  
  if (process.env.NODE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return course as Course | null;
}

async function getCourseDescription(course_id: string): Promise<Course | null> {
  const db = client.db();
  const course = await db
    .collection("courses")
    .findOne({ _id: new ObjectId(course_id) }, { 
      projection: { description: 1 } 
    });
  
  if (process.env.NODE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return course as Course | null;
}

async function getCourseUnits(course_id: string): Promise<Course | null> {
  const db = client.db();
  const course = await db
    .collection("courses")
    .findOne({ _id: new ObjectId(course_id) }, { 
      projection: { units: 1 } 
    });
  
  if (process.env.NODE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  
  return course as Course | null;
}

async function getCourseTimeline(course_id: string): Promise<Course | null> {
  const db = client.db();
  const course = await db
    .collection("courses")
    .findOne({ _id: new ObjectId(course_id) }, { 
      projection: { timeline: 1 } 
    });
  
  if (process.env.NODE_ENV === 'development') {
    await new Promise(resolve => setTimeout(resolve, 600));
  }
  
  return course as Course | null;
}

async function CourseHeader({ course_id }: { course_id: string }) {
  const course = await getCourseHeader(course_id);
  if (!course) return null;
  
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">{course.name}</h1>
      {course.short_description && (
        <div className="mb-4 text-gray-700 italic">
          {course.short_description}
        </div>
      )}
    </>
  );
}

async function CourseDescription({ course_id }: { course_id: string }) {
  const course = await getCourseDescription(course_id);
  if (!course) return null;
  
  return (
    <div className="mb-6 prose">
      <MyMarkdown>{course.description}</MyMarkdown>
    </div>
  );
}

async function CourseUnits({ course_id }: { course_id: string }) {
  const course = await getCourseUnits(course_id);
  if (!course) return null;
  
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Units</h2>
      <ul className="list-disc list-inside">
        {course.units?.map(
          (unit: CourseUnit, idx: number) => (
            <li key={idx}>
              <span className="font-semibold">{unit.name}</span>
              {unit.description && (
                <div className="text-gray-600 text-sm ml-2">
                  {unit.description}
                </div>
              )}
            </li>
          )
        )}
      </ul>
    </div>
  );
}

async function CourseTimeline({ course_id }: { course_id: string }) {
  const course = await getCourseTimeline(course_id);
  if (!course) return null;return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Timeline</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">Type</th>
              <th className="border px-2 py-1">Title</th>
              <th className="border px-2 py-1">Start Date</th>
              <th className="border px-2 py-1">Due Date</th>
              <th className="border px-2 py-1">Grade Release</th>
              <th className="border px-2 py-1">Inferred</th>
            </tr>
          </thead>
          <tbody>
            {course.timeline?.map(
              (item: TimelineItem, idx: number) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{item.type}</td>
                  <td className="border px-2 py-1">{item.title}</td>
                  <td className="border px-2 py-1">
                    {item.start_date}
                    {item.start_date_inferred && (
                      <span className="text-xs text-gray-400 ml-1">*</span>
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {item.due_date}
                    {item.due_date_inferred && (
                      <span className="text-xs text-gray-400 ml-1">*</span>
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {item.grade_release_date}
                    {item.grade_release_date_inferred && (
                      <span className="text-xs text-gray-400 ml-1">*</span>
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {item.start_date_inferred ||
                    item.due_date_inferred ||
                    item.grade_release_date_inferred
                      ? "Yes"
                      : "No"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-400 mt-2">
        * Date marked with * is inferred.
      </div>
    </div>
  );
}

export default async function CourseViewPage({
  params,
}: {
  params: { course_id: string };
}) {
  const session = await redirectUnauthenticated();

  const userId = session?.user?.id;
  const { course_id } = await params;
  
  // Check if course exists first
  const courseExists = await getCourse(course_id);
  if (!courseExists) return notFound();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="space-y-6">
        <Suspense fallback={<CourseHeaderSkeleton />}>
          <CourseHeader course_id={course_id} />
        </Suspense>
        
        <Suspense fallback={<CourseDescriptionSkeleton />}>
          <CourseDescription course_id={course_id} />
        </Suspense>
        
        <Suspense fallback={<CourseUnitsSkeleton />}>
          <CourseUnits course_id={course_id} />
        </Suspense>
        
        <Suspense fallback={<CourseTimelineSkeleton />}>
          <CourseTimeline course_id={course_id} />
        </Suspense>
      </div>
    </div>
  );
}
