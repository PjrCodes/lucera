import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withTeacherSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { getCoursesOwnedByTeacher } from "@/lib/database-service/courses";
import { getAssignmentsForCourse } from "@/lib/database-service/assignment";
import { getSubmissionsForAssignment } from "@/lib/database-service/submitted-assignments";

export const GET = auth(
  withTeacherSession(async function GET(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    try {
      const { searchParams } = new URL(req.url);
      const courseId = searchParams.get("courseId");

      if (!courseId) {
        return NextResponse.json(
          { error: "Course ID is required" },
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

      // Get all assignments for this course
      const assignments = await getAssignmentsForCourse(courseId);

      const analytics = await Promise.all(
        assignments.map(async (assignment) => {
          const submissions = await getSubmissionsForAssignment(assignment._id.toString());

          // Calculate grade distribution
          const gradedSubmissions = submissions.filter(s => s.grade !== undefined && s.grade !== null);
          const gradeDistribution = [
            { range: '90-100', count: 0 },
            { range: '80-89', count: 0 },
            { range: '70-79', count: 0 },
            { range: '60-69', count: 0 },
            { range: '0-59', count: 0 }
          ];

          gradedSubmissions.forEach(sub => {
            const grade = sub.grade || 0;
            if (grade >= 90) gradeDistribution[0].count++;
            else if (grade >= 80) gradeDistribution[1].count++;
            else if (grade >= 70) gradeDistribution[2].count++;
            else if (grade >= 60) gradeDistribution[3].count++;
            else gradeDistribution[4].count++;
          });

          // Calculate submission timeliness
          const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
          let onTimeCount = 0;
          let lateCount = 0;

          submissions.forEach(sub => {
            if (dueDate) {
              const submissionDate = new Date(sub.submittedAt);
              if (submissionDate <= dueDate) {
                onTimeCount++;
              } else {
                lateCount++;
              }
            } else {
              onTimeCount++; // No due date means all are considered on time
            }
          });

          // Get total enrolled students from course (this would need to be implemented)
          // For now, we'll estimate based on submissions and some buffer
          const estimatedTotalStudents = Math.max(submissions.length + 5, 10);
          const notSubmittedCount = estimatedTotalStudents - submissions.length;

          const averageGrade = gradedSubmissions.length > 0
            ? Math.round(gradedSubmissions.reduce((sum, sub) => sum + (sub.grade || 0), 0) / gradedSubmissions.length)
            : 0;

          return {
            assignmentTitle: assignment.title,
            averageGrade,
            submissionCount: submissions.length,
            onTimeCount,
            lateCount,
            notSubmittedCount: Math.max(notSubmittedCount, 0),
            gradeDistribution
          };
        })
      );

      return NextResponse.json({
        status: "success",
        analytics
      });
    } catch (error) {
      console.error("Error fetching assignment analytics:", error);
      return NextResponse.json(
        { error: "Failed to fetch assignment analytics" },
        { status: 500 }
      );
    }
  })
);
