import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withTeacherSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import {
  getCoursesOwnedByTeacher,
  getStudentsForCourse
} from "@/lib/database-service/courses";
import { getAssignmentsForCourse } from "@/lib/database-service/assignment";
import { getSubmissionsForStudent } from "@/lib/database-service/submitted-assignments";

export const GET = auth(
  withTeacherSession(async function GET(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    try {
      // Get query parameters
      const { searchParams } = new URL(req.url);
      const courseId = searchParams.get("courseId");

      if (!courseId) {
        return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
      }

      // Verify teacher owns this course
      const courses = await getCoursesOwnedByTeacher(session.user.id);
      const course = courses.find(c => c._id.toString() === courseId);

      if (!course) {
        return NextResponse.json({ error: "Course not found or access denied" }, { status: 403 });
      }

      // Get course data
      const [students, assignments] = await Promise.all([
        getStudentsForCourse(courseId),
        getAssignmentsForCourse(courseId)
      ]);

      // Calculate progress for each student
      const progress = await Promise.all(
        students.map(async (student) => {
          const submissions = await getSubmissionsForStudent(student.id, courseId);

          const totalAssignments = assignments.length;
          const submittedAssignments = submissions.length;
          const completion = totalAssignments > 0 ? Math.round((submittedAssignments / totalAssignments) * 100) : 0;

          // Calculate average grade
          const gradedSubmissions = submissions.filter(s => s.grade !== undefined && s.grade !== null);
          const averageGrade = gradedSubmissions.length > 0
            ? Math.round(gradedSubmissions.reduce((sum, sub) => sum + (sub.grade || 0), 0) / gradedSubmissions.length)
            : 0;

          return {
            studentName: student.name,
            completion,
            submissions: submissions.length,
            averageGrade
          };
        })
      );

      return NextResponse.json({
        status: "success",
        progress
      });
    } catch (error) {
      console.error("Error fetching course progress:", error);
      return NextResponse.json(
        { error: "Failed to fetch course progress" },
        { status: 500 }
      );
    }
  })
);
