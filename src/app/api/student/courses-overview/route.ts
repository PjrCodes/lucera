import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withStudentSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { getCoursesForUser } from "@/lib/database-service/courses";
import { getSubmissionsForStudent } from "@/lib/database-service/submitted-assignments";
import { getAssignmentsForCourse } from "@/lib/database-service/assignment";

export const GET = auth(
  withStudentSession(async function GET(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    try {
      // Get all courses for the student
      const enrolledCourses = await getCoursesForUser(session.user.id);

      if (!enrolledCourses || enrolledCourses.length === 0) {
        return NextResponse.json({
          status: "success",
          courses: [],
          message: "You are not enrolled in any courses yet."
        });
      }

      // For each course, calculate progress and average grade
      const courseOverviews = await Promise.all(
        enrolledCourses.map(async (course) => {
          const assignments = await getAssignmentsForCourse(course._id.toString());
          const submissions = await getSubmissionsForStudent(
            session.user.id,
            course._id.toString()
          );

          // Calculate statistics
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

          return {
            courseId: course._id.toString(),
            courseName: course.name,
            courseCode: course.courseCode,
            shortDescription: course.shortDescription,
            completionPercentage,
            averageGrade,
            totalAssignments,
            submittedAssignments,
            gradedAssignments: gradedSubmissions.length
          };
        })
      );

      return NextResponse.json({
        status: "success",
        courses: courseOverviews
      });
    } catch (error) {
      console.error("Error fetching student course overview:", error);
      return NextResponse.json(
        { error: "Failed to fetch course overview" },
        { status: 500 }
      );
    }
  })
);
