import { NextResponse } from "next/server";
import { callLLMWithSchema } from "@/lib/llm/call-llm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { course, assignments } = body;

    // Validate input data
    if (!course || !assignments) {
      return NextResponse.json(
        { error: "Course and assignments data are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(assignments)) {
      return NextResponse.json(
        { error: "Assignments must be an array" },
        { status: 400 }
      );
    }

    // Calculate performance metrics from the provided data
    const gradedAssignments = assignments.filter(a => a.grade !== null && a.grade !== undefined);
    const submittedAssignments = assignments.filter(a => a.status === 'submitted' || a.status === 'late');
    
    const averageGrade = gradedAssignments.length > 0
      ? gradedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0) / gradedAssignments.length
      : 0;

    // Identify weak areas by looking at low grades and overdue assignments
    const lowGradeAssignments = gradedAssignments.filter(a => a.grade < 60);
    const overdueAssignments = assignments.filter(a => a.status === 'overdue');

    // Prepare prompt for AI analysis
    const systemPrompt = `You are an educational assistant that provides personalized study recommendations for students.
    Analyze the student's performance data and provide specific, actionable tips to help them improve in areas where they're struggling.
    Focus on identifying weak topics and providing concrete study strategies.
    Be encouraging but honest about areas that need improvement.`;

    const userPrompt = `
    Course: ${course.courseName} (${course.courseCode})
    
    Student Performance Summary:
    - Average Grade: ${averageGrade.toFixed(1)}%
    - Assignments Completed: ${submittedAssignments.length}/${assignments.length}
    - Assignments Graded: ${gradedAssignments.length}/${assignments.length}
    - Course Completion: ${course.completionPercentage || 0}%

    Detailed Assignment Performance:
    ${assignments.map(a => `
    - ${a.title}
      Topics: ${Array.isArray(a.topics) ? a.topics.join(', ') : 'General'}
      Grade: ${a.grade !== null && a.grade !== undefined ? `${a.grade}/${a.totalPoints || 100}` : 'Not graded'}
      Status: ${a.status}
      ${a.dueDate ? `Due Date: ${a.dueDate}` : ''}
      ${a.submissionDate ? `Submitted: ${a.submissionDate}` : 'Not submitted'}
    `).join('\n')}

    ${lowGradeAssignments.length > 0 ? `
    Low Performance Areas:
    ${lowGradeAssignments.map(a => `- ${a.title} (${a.grade}%): Topics - ${Array.isArray(a.topics) ? a.topics.join(', ') : 'General'}`).join('\n')}
    ` : ''}

    ${overdueAssignments.length > 0 ? `
    Overdue/Missing Assignments:
    ${overdueAssignments.map(a => `- ${a.title}: Topics - ${Array.isArray(a.topics) ? a.topics.join(', ') : 'General'}`).join('\n')}
    ` : ''}

    Please analyze this performance data and provide:
    1. **Areas of Concern**: Identify specific topics or patterns where the student is struggling
    2. **Immediate Actions**: What the student should prioritize right now
    3. **Study Strategies**: Concrete, actionable study recommendations for weak areas
    4. **Long-term Improvements**: Habits and approaches for sustained success
    5. **Encouragement**: Positive reinforcement for areas where the student is doing well

    Keep recommendations practical, specific, and encouraging. Format your response in clear sections with bullet points.
    Aim for 200-400 words total. Add emojis if you can, to make the output look inviting and engaging to the user.
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
        { error: "Failed to generate improvement tips. Our AI service is temporarily unavailable." },
        { status: 500 }
      );
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(llmResponse);
    } catch (parseError) {
      console.error("Failed to parse LLM response:", parseError);
      return NextResponse.json(
        { error: "Invalid response from AI service. Please try again." },
        { status: 500 }
      );
    }

    const tips = parsedResponse.tips;

    if (!tips || typeof tips !== "string") {
      return NextResponse.json(
        { error: "AI service returned invalid format. Please try again." },
        { status: 500 }
      );
    }

    // Return in the format expected by the frontend
    return NextResponse.json({
      data: tips,
      metadata: {
        averageGrade: Math.round(averageGrade),
        totalAssignments: assignments.length,
        completedAssignments: submittedAssignments.length,
        gradedAssignments: gradedAssignments.length,
        completionPercentage: course.completionPercentage || 0
      }
    });

  } catch (error) {
    console.error("Error generating improvement tips:", error);
    
    // Provide specific error messages based on error type
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request format. Please check your data and try again." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "An unexpected error occurred while generating tips. Please try again later." },
      { status: 500 }
    );
  }
}
