import fs from "fs";
import { Course } from "@/lib/schemas/database";
import { callLLMWithSchema } from "./call-llm";
import {
  assignmentExtractorLLMSchema,
  assignmentExtractorSchema,
  ExtractedAssignment,
} from "@/lib/schemas/llm";

const contentExtractorUserPrompt = fs.readFileSync(
  "./src/appdata/prompts/assignment_extractor/user.txt",
  "utf-8"
);
const contentExtractorSystemPrompt = fs.readFileSync(
  "./src/appdata/prompts/assignment_extractor/system.txt",
  "utf-8"
);

type LLMAssignmentExtractorResult =
  | { success: true; error: null; data: ExtractedAssignment }
  | { success: false; error: string; data: null };

export async function LLMAssignmentExtractor(
  fileBuffer: Buffer,
  course: Course
): Promise<LLMAssignmentExtractorResult> {
  let counter = 1;
  const topicList = course.units
    .map((unit) => `${counter++}. ${unit.name}: ${unit.description}`)
    .join("\n");

  const llmTextResponse = callLLMWithSchema(
    assignmentExtractorLLMSchema,
    contentExtractorSystemPrompt,
    contentExtractorUserPrompt.replace("INSERT_TOPIC_LIST_HERE", topicList),
    {
      fileBuffer: fileBuffer,
      fileName: "content.pdf",
      mimeType: "application/pdf",
    }
  );

  try {
    const parsedResponse =
      assignmentExtractorSchema.parse(llmTextResponse);
    return {
      success: true,
      error: null,
      data: parsedResponse,
    };
  } catch (error) {
    console.error(
      "[LLM_ASSIGNMENT_EXTRACTOR]: Error parsing LLM response:",
      error
    );
    return {
      success: false,
      error: "Failed to parse LLM response",
      data: null,
    };
  }
}
