import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withStudentSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { getCourseById, getCoursesForUser } from "@/lib/database-service/courses";
import { getSubmissionsForStudent } from "@/lib/database-service/submitted-assignments";
import { getAssignmentsForCourse } from "@/lib/database-service/assignment";

export const GET = auth(
  withStudentSession(async function GET(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    try {
      const { searchParams } = new URL(req.url!);
      const courseId = searchParams.get('courseId');

      if (!courseId) {
        return NextResponse.json(
          { error: "Course ID is required" },
          { status: 400 }
        );
      }

      // Verify student is enrolled in this course
      const course = await getCourseById(courseId);
      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }

      // Verify student is actually enrolled in this course
      const enrolledCourses = await getCoursesForUser(session.user.id);
      const isEnrolled = enrolledCourses.some(c => c._id.toString() === courseId);

      if (!isEnrolled) {
        return NextResponse.json(
          { error: "You are not enrolled in this course" },
          { status: 403 }
        );
      }

      // Get all assignments for the course
      const assignments = await getAssignmentsForCourse(courseId);

      // Get student's submissions for this course
      const submissions = await getSubmissionsForStudent(session.user.id, courseId);

      // Create a map of submissions by assignment ID for quick lookup
      const submissionMap = new Map(
        submissions.map(sub => [sub.assignmentId, sub])
      );

      // Build detailed assignment performance data
      const assignmentDetails = assignments.map(assignment => {
        const submission = submissionMap.get(assignment._id.toString());
        const now = new Date();

        let status: 'submitted' | 'late' | 'overdue' = 'overdue';
        if (submission) {
          if (assignment.dueDate) {
            const dueDate = new Date(assignment.dueDate);
            const submissionDate = new Date(submission.submittedAt);
            status = submissionDate <= dueDate ? 'submitted' : 'late';
          } else {
            status = 'submitted';
          }
        } else if (assignment.dueDate) {
          // No submission - check if overdue or still open
          const dueDate = new Date(assignment.dueDate);
          status = now > dueDate ? 'overdue' : 'overdue'; // Still mark as overdue if not submitted
        }

        return {
          assignmentId: assignment._id.toString(),
          title: assignment.title,
          description: assignment.description,
          topics: assignment.topics || [],
          dueDate: assignment.dueDate,
          grade: submission?.grade || null,
          submissionDate: submission?.submittedAt || null,
          status,
          totalPoints: assignment.grading?.total_points || 100,
          gradingType: assignment.grading?.type || 'percentage'
        };
      });

      // Calculate overall statistics
      const totalAssignments = assignments.length;
      const submittedAssignments = submissions.length;
      const gradedSubmissions = submissions.filter(s => s.grade !== null);

      let averageGrade = 0;
      if (gradedSubmissions.length > 0) {
        const totalGrade = gradedSubmissions.reduce((sum, submission) =>
          sum + (submission.grade || 0), 0
        );
        averageGrade = Math.round(totalGrade / gradedSubmissions.length);
      }

      const completionPercentage = totalAssignments > 0
        ? Math.round((submittedAssignments / totalAssignments) * 100)
        : 0;

      return NextResponse.json({
        status: "success",
        courseDetails: {
          courseId: course._id.toString(),
          courseName: course.name,
          courseCode: course.courseCode,
          completionPercentage,
          averageGrade,
          totalAssignments,
          submittedAssignments,
          gradedAssignments: gradedSubmissions.length
        },
        assignments: assignmentDetails
      });
    } catch (error) {
      console.error("Error fetching student course details:", error);
      return NextResponse.json(
        { error: "Failed to fetch course details" },
        { status: 500 }
      );
    }
  })
);
