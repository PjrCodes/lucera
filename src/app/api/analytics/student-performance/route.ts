import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withTeacherSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { getCoursesOwnedByTeacher } from "@/lib/database-service/courses";
import { getAssignmentsForCourse } from "@/lib/database-service/assignment";
import { getSubmissionsForStudent } from "@/lib/database-service/submitted-assignments";

export const GET = auth(
  withTeacherSession(async function GET(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    try {
      const { searchParams } = new URL(req.url);
      const studentId = searchParams.get("studentId");
      const courseId = searchParams.get("courseId");

      if (!studentId || !courseId) {
        return NextResponse.json(
          { error: "Student ID and Course ID are required" },
          { status: 400 }
        );
      }

      // Verify teacher owns this course
      const courses = await getCoursesOwnedByTeacher(session.user.id);
      const course = courses.find(c => c._id.toString() === courseId);

      if (!course) {
        return NextResponse.json(
          { error: "Course not found or access denied" },
          { status: 403 }
        );
      }

      // Get student submissions for this course
      const submissions = await getSubmissionsForStudent(studentId, courseId);

      // Get all assignments for the course to calculate completion
      const assignments = await getAssignmentsForCourse(courseId);

      // Calculate course completion percentage
      const totalAssignments = assignments.length;
      const submittedAssignments = submissions.length;
      const courseCompletion = totalAssignments > 0 ? Math.round((submittedAssignments / totalAssignments) * 100) : 0;

      // Format assignment data
      const assignmentData = assignments.map(assignment => {
        const submission = submissions.find(s => s.assignmentId === assignment._id.toString());

        let status: 'submitted' | 'late' | 'missing' = 'missing';
        if (submission) {
          const dueDate = new Date(assignment.dueDate || '');
          const submissionDate = new Date(submission.submittedAt);
          status = submissionDate <= dueDate ? 'submitted' : 'late';
        }

        return {
          title: assignment.title,
          grade: submission?.grade || null,
          submissionDate: submission ? submission.submittedAt.toISOString() : null,
          dueDate: assignment.dueDate || '',
          status
        };
      });

      // Get student name from submissions (if any exist)
      const studentName = submissions.length > 0 ? submissions[0].student?.name || 'Unknown Student' : 'Unknown Student';

      const performance = {
        studentId,
        studentName,
        courseCompletion,
        assignments: assignmentData
      };

      return NextResponse.json({
        status: "success",
        performance
      });
    } catch (error) {
      console.error("Error fetching student performance:", error);
      return NextResponse.json(
        { error: "Failed to fetch student performance" },
        { status: 500 }
      );
    }
  })
);
