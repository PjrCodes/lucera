import { EditCourseClient } from '@/components/editCourseClient';
import { notFound } from 'next/navigation';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';

// Async wrapper to await params
export default async function EditCoursePage({ params }: { params: { course_id: string } }) {
  const { course_id } = await params;

  // fetch coruse data
    if (!course_id) {
        return notFound();
    }

    const db = client.db();
    const course = await db.collection('courses').findOne({ _id: new ObjectId(course_id) });
    
    if (!course) {
        return notFound();
    }

  return <EditCourseClient course={course} />;
}
