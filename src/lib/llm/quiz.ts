import fs from "fs";
import { callLLMWithSchema } from "./call-llm";
import {
  ExtractedQuiz,
  quizExtractorLLMSchema,
  quizExtractorSchema,
  ContentBasedQuizInput,
} from "@/lib/schemas/llm";

const quizExtractorUserPrompt = fs.readFileSync(
  "./src/appdata/prompts/quiz_extractor/user.txt",
  "utf-8",
);
const quizExtractorSystemPrompt = fs.readFileSync(
  "./src/appdata/prompts/quiz_extractor/system.txt",
  "utf-8",
);

type LLMQuizExtractorResult =
  | { success: true; error: null; data: ExtractedQuiz }
  | { success: false; error: string; data: null };

export async function LLMContentBasedQuizExtractor(
  quizInput: ContentBasedQuizInput,
): Promise<LLMQuizExtractorResult> {
  try {
    // Create a comprehensive prompt with course content
    const contentPrompt = `
COURSE INFORMATION:
Course Name: ${quizInput.courseName}
Course Code: ${quizInput.courseCode}

COURSE TOPICS/UNITS:
${quizInput.courseTopics.map((topic, index) => `${index + 1}. ${topic}`).join('\n')}

CONTENT SUMMARIES:
${quizInput.contentSummaries.map((summary, index) => `Content ${index + 1}: ${summary}`).join('\n\n')}

${quizExtractorUserPrompt}
    `;

    const llmTextResponse = await callLLMWithSchema(
      quizExtractorLLMSchema,
      quizExtractorSystemPrompt,
      contentPrompt,
      null, // No file needed since we're providing structured content
    );

    if (!llmTextResponse || typeof llmTextResponse !== "string") {
      return {
        success: false,
        error: "Invalid LLM response",
        data: null,
      };
    }

    const parsedResponse = quizExtractorSchema.parse(
      JSON.parse(llmTextResponse),
    );

    return {
      success: true,
      error: null,
      data: parsedResponse,
    };
  } catch (error) {
    console.error("[LLM_CONTENT_QUIZ_EXTRACTOR]: Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

// Keep the old function for backward compatibility but mark as deprecated
/** @deprecated Use LLMContentBasedQuizExtractor instead */
export async function LLMQuizExtractor(
  fileBuffer: Buffer,
): Promise<LLMQuizExtractorResult> {
  try {
    const llmTextResponse = await callLLMWithSchema(
      quizExtractorLLMSchema,
      quizExtractorSystemPrompt,
      quizExtractorUserPrompt,
      {
        fileBuffer: fileBuffer,
        fileName: "syllabus.pdf",
        mimeType: "application/pdf",
      },
    );

    if (!llmTextResponse || typeof llmTextResponse !== "string") {
      return {
        success: false,
        error: "Invalid LLM response",
        data: null,
      };
    }

    const parsedResponse = quizExtractorSchema.parse(
      JSON.parse(llmTextResponse),
    );

    return {
      success: true,
      error: null,
      data: parsedResponse,
    };
  } catch (error) {
    console.error("[LLM_QUIZ_EXTRACTOR]: Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}
