import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withStudentSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { getCourseById, getCoursesForUser } from "@/lib/database-service/courses";
import { getSubmissionsForStudent } from "@/lib/database-service/submitted-assignments";
import { getAssignmentsForCourse } from "@/lib/database-service/assignment";
import { callLLMWithSchema } from "@/lib/llm/call-llm";

export const POST = auth(
  withStudentSession(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    try {
      const body = await req.json();
      const { courseId } = body;

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

      // Prepare performance data for AI analysis
      const performanceData = assignments.map(assignment => {
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
          const dueDate = new Date(assignment.dueDate);
          status = now > dueDate ? 'overdue' : 'overdue'; // Still mark as overdue if not submitted
        }

        return {
          title: assignment.title,
          topics: assignment.topics || [],
          grade: submission?.grade || null,
          maxGrade: assignment.grading?.total_points || 100,
          submitted: !!submission,
          status: status
        };
      });

      // Calculate overall performance metrics
      const gradedAssignments = performanceData.filter(p => p.grade !== null);
      const averageGrade = gradedAssignments.length > 0
        ? gradedAssignments.reduce((sum, p) => sum + (p.grade || 0), 0) / gradedAssignments.length
        : 0;

      // Prepare prompt for AI analysis
      const systemPrompt = `You are an educational assistant that provides personalized study recommendations for students.
      Analyze the student's performance data and provide specific, actionable tips to help them improve in areas where they're struggling.
      Focus on identifying weak topics and providing concrete study strategies.`;

      const userPrompt = `
      Course: ${course.name} (${course.courseCode})
      Course Topics: ${course.units?.map(u => u.name).join(', ') || 'Not specified'}

      Student Performance Summary:
      - Average Grade: ${averageGrade.toFixed(1)}%
      - Assignments Completed: ${performanceData.filter(p => p.submitted).length}/${performanceData.length}
      - Assignments Graded: ${gradedAssignments.length}/${performanceData.length}

      Detailed Assignment Performance:
      ${performanceData.map(p => `
      - ${p.title}
        Topics: ${p.topics.join(', ') || 'General'}
        Grade: ${p.grade !== null ? `${p.grade}/${p.maxGrade}` : 'Not graded'}
        Status: ${p.status}
      `).join('\n')}

      Please analyze this performance data and provide:
      1. **Weak Areas**: Identify specific topics or assignment types where the student is struggling
      2. **Improvement Strategies**: Concrete, actionable study recommendations
      3. **Priority Focus**: What should the student focus on first
      4. **Study Tips**: Specific techniques for better understanding of weak topics

      Keep recommendations practical and encouraging. Format your response in clear sections with bullet points.
      `;

      // Call LLM for personalized tips
      const llmResponse = await callLLMWithSchema(
        {
          type: "object",
          properties: {
            tips: {
              type: "string",
              description: "Personalized improvement tips in markdown format"
            }
          },
          required: ["tips"]
        },
        systemPrompt,
        userPrompt,
        null
      );

      if (!llmResponse) {
        return NextResponse.json(
          { error: "Failed to generate improvement tips" },
          { status: 500 }
        );
      }

      const parsedResponse = JSON.parse(llmResponse);
      const tips = parsedResponse.tips;

      if (!tips || typeof tips !== "string") {
        return NextResponse.json(
          { error: "Invalid response format from AI" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: "success",
        tips: tips,
        performanceSummary: {
          courseId: course._id.toString(),
          courseName: course.name,
          averageGrade: Math.round(averageGrade),
          totalAssignments: performanceData.length,
          completedAssignments: performanceData.filter(p => p.submitted).length,
          gradedAssignments: gradedAssignments.length
        }
      });
    } catch (error) {
      console.error("Error generating improvement tips:", error);
      return NextResponse.json(
        { error: "Failed to generate improvement tips" },
        { status: 500 }
      );
    }
  })
);
