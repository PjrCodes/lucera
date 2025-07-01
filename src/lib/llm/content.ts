import fs from "fs";
import { Course } from "@/lib/schemas/database";
import { callLLMWithSchema } from "./call-llm";
import {
  contentExtractorLLMSchema,
  contentExtractorSchema,
  ExtractedContent,
} from "@/lib/schemas/llm";

const contentExtractorUserPrompt = fs.readFileSync(
  "./src/appdata/prompts/content_extractor/user.txt",
  "utf-8",
);
const contentExtractorSystemPrompt = fs.readFileSync(
  "./src/appdata/prompts/content_extractor/system.txt",
  "utf-8",
);

type LLMContentExtractorResult =
  | { success: true; error: null; data: ExtractedContent }
  | { success: false; error: string; data: null };

export async function LLMContentExtractor(
  fileBuffer: Buffer,
  course: Course,
): Promise<LLMContentExtractorResult> {
  let counter = 1;
  const topicList = course.units
    .map((unit) => `${counter++}. ${unit.name}: ${unit.description}`)
    .join("\n");

  const llmTextResponse = await callLLMWithSchema(
    contentExtractorLLMSchema,
    contentExtractorSystemPrompt,
    contentExtractorUserPrompt.replace("INSERT_TOPIC_LIST_HERE", topicList),
    {
      fileBuffer: fileBuffer,
      fileName: "content.pdf",
      mimeType: "application/pdf",
    },
  );

  try {
    const parsedResponse = contentExtractorSchema.parse(
      JSON.parse(llmTextResponse),
    );
    return {
      success: true,
      error: null,
      data: parsedResponse,
    };
  } catch (error) {
    console.error(
      "[LLM_CONTENT_EXTRACTOR]: Error parsing LLM response:",
      error,
    );
    return {
      success: false,
      error: "Failed to parse LLM response",
      data: null,
    };
  }
}
