import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withAuthorisation } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { getAssignmentsForCourse } from "@/lib/database-service/assignment";
import { getCoursesOwnedByTeacher, getCoursesForUser } from "@/lib/database-service/courses";
import { getUserData } from "@/lib/database-service/auth";
import { Course } from "@/lib/schemas/database";

export const GET = auth(
  withAuthorisation(async function GET(
    req: NextAuthRequest,
    session: AuthenticatedSession,
    params: Promise<{ courseId: string }>
  ) {
    try {
      const { courseId } = await params;

      if (!courseId) {
        return NextResponse.json(
          { error: "Course ID is required" },
          { status: 400 }
        );
      }

      // Get user data to check role
      const userData = await getUserData(session.user.id);

      // Check if user has access to this course
      let hasAccess = false;
      if (userData.role === "teacher") {
        const teacherCourses = await getCoursesOwnedByTeacher(session.user.id);
        hasAccess = teacherCourses.some(course => course._id.toString() === courseId);
      } else {
        const studentCourses = await getCoursesForUser(session.user.id);
        hasAccess = studentCourses.some((course: Course) => course._id.toString() === courseId);
      }

      if (!hasAccess) {
        return NextResponse.json(
          { error: "Access denied to this course" },
          { status: 403 }
        );
      }

      const assignments = await getAssignmentsForCourse(courseId);

      // Return basic assignment information
      const assignmentInfo = assignments.map(assignment => ({
        _id: assignment._id.toString(),
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        totalPoints: assignment.grading?.total_points || 100,
        gradingMethod: assignment.grading?.method || 'percentage'
      }));

      return NextResponse.json({
        status: "success",
        assignments: assignmentInfo
      });
    } catch (error) {
      console.error("Error fetching course assignments:", error);
      return NextResponse.json(
        { error: "Failed to fetch assignments" },
        { status: 500 }
      );
    }
  })
);
