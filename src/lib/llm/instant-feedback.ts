import fs from "fs";
import { Assignment } from "@/lib/schemas/database";
import { callLLMWithSchema } from "./call-llm";

const instantFeedbackUserPrompt = fs.readFileSync(
  "./src/appdata/prompts/instant_feedback/user.txt",
  "utf-8"
);

type LLMInstantFeedbackResult =
  | { success: true; error: null; data: string }
  | { success: false; error: string; data: null };

export async function LLMInstantFeedback(
  assignment: Assignment,
  submissionType: "file_upload" | "text_entry",
  submissionContent?: string,
  fileBuffer?: Buffer,
  fileName?: string,
  mimeType?: string
): Promise<LLMInstantFeedbackResult> {
  try {
    // Prepare assignment details
    const assignmentDetails = `
Title: ${assignment.title}
Description: ${assignment.description}
Topics: ${assignment.topics.join(", ")}
Submission Type: ${assignment.submissionType}
${
  assignment.grading
    ? `
Grading Criteria:
- Type: ${assignment.grading.type}
- Total Points: ${assignment.grading.total_points}
${
  assignment.grading.rubric?.criteria?.length > 0
    ? `
- Criteria: ${assignment.grading.rubric.criteria
        .map((c) => `${c.description} (${c.points} points)`)
        .join("\n  ")}
`
    : ""
}
`
    : ""
}}
    `.trim();

    // Prepare student submission content
    let studentSubmission = "";
    if (submissionType === "text_entry" && submissionContent) {
      studentSubmission = `Text Submission:\n${submissionContent}`;
    } else if (submissionType === "file_upload") {
      studentSubmission =
        "File Submission: Please analyze the attached PDF file.";
    }

    // Replace placeholders in the user prompt
    const finalUserPrompt = instantFeedbackUserPrompt
      .replace("{{ASSIGNMENT_DETAILS}}", assignmentDetails)
      .replace("{{STUDENT_SUBMISSION}}", studentSubmission);
    console.log("Final User Prompt:", finalUserPrompt);
    // Prepare file details for LLM call
    const fileDetails =
      fileBuffer && fileName && mimeType
        ? {
            fileBuffer,
            fileName,
            mimeType,
          }
        : null;

    // Call LLM with a simple schema for text response
    const llmTextResponse = await callLLMWithSchema(
      {
        type: "object",
        properties: {
          feedback: {
            type: "string",
            description:
              "Detailed feedback for the student submission in markdown format",
          },
        },
        required: ["feedback"],
      },
      "You are a helpful teaching assistant providing constructive feedback on student assignments. Provide clear, specific, and actionable feedback in markdown format.",
      finalUserPrompt,
      fileDetails
    );

    if (!llmTextResponse) {
      return {
        success: false,
        error: "Failed to generate feedback from LLM",
        data: null,
      };
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(llmTextResponse);
    const feedback = parsedResponse.feedback;

    if (!feedback || typeof feedback !== "string") {
      return {
        success: false,
        error: "Invalid feedback format received from LLM",
        data: null,
      };
    }

    return {
      success: true,
      error: null,
      data: feedback,
    };
  } catch (error) {
    console.error("Error in LLMInstantFeedback:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      data: null,
    };
  }
}
