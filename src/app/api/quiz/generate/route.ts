import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { withStudentSession } from "@/lib/database-service/auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { getCourseById } from "@/lib/database-service/courses";
import { LLMContentBasedQuizExtractor } from "@/lib/llm/quiz";
import { getCoursesForUser } from "@/lib/database-service/courses";
import { getContentForCourse } from "@/lib/database-service/content";

export const POST = auth(
  withStudentSession(async function POST(
    req: NextAuthRequest,
    session: AuthenticatedSession,
  ) {
    try {
      const { courseId } = await req.json();

      if (!courseId) {
        return NextResponse.json(
          { error: "Course ID is required" },
          { status: 400 }
        );
      }

      // Verify student is enrolled in this course
      const enrolledCourses = await getCoursesForUser(session.user.id);
      const isEnrolled = enrolledCourses.some(
        (course) => course._id.toString() === courseId
      );

      if (!isEnrolled) {
        return NextResponse.json(
          { error: "You are not enrolled in this course" },
          { status: 403 }
        );
      }

      // Get course details
      const course = await getCourseById(courseId);
      
      if (!course) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }

      // Get course content for quiz generation
      const courseContent = await getContentForCourse(courseId);
      
      if (courseContent.length === 0) {
        return NextResponse.json(
          { error: "No course content available for quiz generation" },
          { status: 400 }
        );
      }

      // Prepare quiz input data
      const courseTopics = course.units.map(unit => unit.name);
      const contentSummaries = courseContent.map(content => 
        `${content.title}: ${content.description || 'Course material'}`
      );

      if (courseTopics.length === 0) {
        return NextResponse.json(
          { error: "Course has no topics defined" },
          { status: 400 }
        );
      }

      const quizInput = {
        courseName: course.name,
        courseCode: course.courseCode,
        courseTopics,
        contentSummaries,
      };

      // Generate quiz using LLM
      const quizResult = await LLMContentBasedQuizExtractor(quizInput);

      if (!quizResult.success) {
        return NextResponse.json(
          { error: "Failed to generate quiz: " + quizResult.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        quiz: quizResult.data,
        courseName: course.name,
        courseCode: course.courseCode,
      });
    } catch (error) {
      console.error("[QUIZ_GENERATION]: Error:", error);
      return NextResponse.json(
        { error: "Failed to generate quiz" },
        { status: 500 }
      );
    }
  })
);
