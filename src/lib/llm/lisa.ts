import { GoogleGenAI, Type } from "@google/genai";
import { ChatRequest } from "../schemas/api";
import fs from "fs";

const queryAugmentationUserPrompt = fs.readFileSync(
  "./src/appdata/prompts/query_augmentation/user.txt",
  "utf-8"
);

export async function synonymAugmentation(query: string): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {
    thinkingConfig: {
      thinkingBudget: 0,
    },
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        augmentedQuery: {
          type: Type.STRING,
        },
      },
    },
  };
  const model = "gemini-2.5-flash";
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: queryAugmentationUserPrompt.replace("{{USER_QUERY}}", query),
        },
      ],
    },
  ];
  let llmTextResponse = "";
  try {
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });
    for await (const chunk of response) {
      if (chunk.text) {
        llmTextResponse += chunk.text;
      }
    }
  } catch (error) {
    console.error("Error during LLM call:", error);
    throw new Error("Failed to augment query with synonyms");
  }

  console.log("LLM Response:", llmTextResponse);

  return query;
}

export async function callLisa(context: ChatRequest) {
  console.log(context);
  const query = await synonymAugmentation(context.query);

  console.log("query", query);

  // For now, we will return a mock response
  return {
    answer: "This is a mock answer from Lisa based on the provided context.",
    confidence: 0.95,
  };
}
