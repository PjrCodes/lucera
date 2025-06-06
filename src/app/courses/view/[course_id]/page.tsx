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
  if (!course) return null;

  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'quiz':
        return '❓';
      case 'assignment':
        return '📝';
      case 'midsem_exam':
        return '📚';
      case 'endsem_exam':
        return '🎓';
      default:
        return '📅';
    }
  };

  const getEventColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'quiz':
        return 'bg-blue-500';
      case 'assignment':
        return 'bg-green-500';
      case 'midsem_exam':
        return 'bg-orange-500';
      case 'endsem_exam':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Timeline</h2>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
        
        <div className="space-y-6">
          {course.timeline?.map((item: TimelineItem, idx: number) => (
            <div key={idx} className="relative flex items-start">
              {/* Icon circle */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${getEventColor(item.type)} text-white text-xl shadow-lg`}>
                {getEventIcon(item.type)}
              </div>
              
              {/* Content */}
              <div className="ml-6 flex-1">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">{item.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getEventColor(item.type)}`}>
                      {item.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-4">
                      📅 <strong>Start:</strong> {new Date(item.start_date).toLocaleDateString()}
                    </span>
                    <span>
                      ⏰ <strong>Due:</strong> {new Date(item.due_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {course.timeline?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <p>No timeline events available</p>
          </div>
        )}
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
