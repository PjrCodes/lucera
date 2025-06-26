import fs from "fs";
import { callLLMWithSchema } from "./call-llm";
import {
  ExtractedSyllabus,
  syllabusExtractorLLMResponseSchema,
  syllabusExtractorSchema,
} from "@/lib/schemas/llm";

const syllabusExtractorUserPrompt = fs.readFileSync(
  "./src/appdata/prompts/syllabus_extractor/user.txt",
  "utf-8"
);
const syllabusExtractorSystemPrompt = fs.readFileSync(
  "./src/appdata/prompts/syllabus_extractor/system.txt",
  "utf-8"
);

type LLMSyllabusExtractorResult =
  | { success: true; error: null; data: ExtractedSyllabus }
  | { success: false; error: string; data: null };

export async function LLMSyllabusExtractor(
  fileBuffer: Buffer
): Promise<LLMSyllabusExtractorResult> {
  // save the text to a file for debugging purposes

  const llmTextResponse = await callLLMWithSchema(
    syllabusExtractorSchema,
    syllabusExtractorSystemPrompt,
    syllabusExtractorUserPrompt,
    {
      fileBuffer: fileBuffer,
      fileName: "syllabus.pdf",
      mimeType: "application/pdf",
    }
  );

  try {
    const parsedResponse =
      syllabusExtractorLLMResponseSchema.parse(llmTextResponse);

    // further parsing of content into DATE

    return {
      success: true,
      error: null,
      data: parsedResponse,
    };
  } catch (error) {
    console.error("Error parsing LLM response:", error);
    return {
      success: false,
      error: "Failed to parse LLM response",
      data: null,
    };
  }
}
