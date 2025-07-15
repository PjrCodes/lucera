import { NextRequest, NextResponse } from "next/server";
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
      totalSubmissions += submissions.length;

      // Process submissions for analytics
      submissions.forEach(submission => {
        // Track submissions by week
        const weekKey = getWeekKey(new Date(submission.submittedAt));
        submissionsByWeek.set(weekKey, (submissionsByWeek.get(weekKey) || 0) + 1);

        // Track grade distribution
        if (submission.grade !== null) {
          const letterGrade = getLetterGrade(submission.grade);
          gradeDistribution[letterGrade as keyof typeof gradeDistribution]++;
        }
      });
    }

    // Calculate completion rate
    const expectedSubmissions = totalStudents * totalAssignments;
    const completionRate = expectedSubmissions > 0 ? (totalSubmissions / expectedSubmissions) * 100 : 0;

    // Prepare weekly data for chart
    const weeklyData = Array.from(submissionsByWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8) // Last 8 weeks
      .map(([week, count]) => ({
        week: formatWeek(week),
        submissions: count
      }));

    // Prepare grade distribution data
    const gradeData = Object.entries(gradeDistribution).map(([grade, count]) => ({
      grade,
      count,
      percentage: totalSubmissions > 0 ? (count / totalSubmissions) * 100 : 0
    }));

    return NextResponse.json({
      course: {
        id: course.id,
        name: course.name,
        description: course.description
      },
      stats: {
        totalStudents,
        totalAssignments,
        totalSubmissions,
        completionRate: Math.round(completionRate * 100) / 100,
        averageGrade: calculateAverageGrade(assignments)
      },
      charts: {
        weeklySubmissions: weeklyData,
        gradeDistribution: gradeData
      }
    });

  } catch (error) {
    console.error("Error fetching course progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function formatWeek(weekKey: string): string {
  const [year, week] = weekKey.split('-W');
  return `W${week}`;
}

function getLetterGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

async function calculateAverageGrade(assignments: any[]): Promise<number> {
  let totalGrades = 0;
  let gradeCount = 0;

  for (const assignment of assignments) {
    const submissions = await getSubmissionsForAssignment(assignment.id);
    submissions.forEach(submission => {
      if (submission.grade !== null) {
        totalGrades += submission.grade;
        gradeCount++;
      }
    });
  }

  return gradeCount > 0 ? Math.round((totalGrades / gradeCount) * 100) / 100 : 0;
}
