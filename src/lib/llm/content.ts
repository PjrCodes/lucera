import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { Course } from "../schemas";

const contentUserPrompt = fs.readFileSync(
  "./src/appdata/prompts/content_extractor/user.txt",
  "utf-8"
);
const contentSystemPrompt = fs.readFileSync(
  "./src/appdata/prompts/content_extractor/system.txt",
  "utf-8"
);

const contentDecoderSchema = {
  type: Type.OBJECT,
  required: ["title", "description", "short_description", "topics"],
  properties: {
    title: {
      type: Type.STRING,
    },
    description: {
      type: Type.STRING,
    },
    short_description: {
      type: Type.STRING,
    },
    topics: {
      type: Type.ARRAY,
      items: {
        type: Type.NUMBER,
      },
    },
  },
};

interface LLMContentParseResponse {
  title: string;
  shortDescription: string;
  description: string;
  topics: number[];
}

export async function LLMContentParse(
  filePath: string,
  course: Course
): Promise<LLMContentParseResponse> {
  let counter = 1;
  const topicList = course.units
    .map((unit) => `${counter++}. ${unit.name}: ${unit.description}`)
    .join("\n");

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {
    thinkingConfig: {
      thinkingBudget: 0,
    },
    responseMimeType: "application/json",
    responseSchema: contentDecoderSchema,
    systemInstruction: [
      {
        text: contentSystemPrompt,
      },
    ],
  };
  const model = "gemini-2.5-flash";
  const contents = [
    {
      role: "user",
      parts: [
        {
          inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            filename: "content.pdf",
            mimeType: `application/pdf`,
          },
        },
        {
          text: contentUserPrompt.replace("INSERT_TOPIC_LIST_HERE", topicList),
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let allText = "";
  for await (const chunk of response) {
    if (chunk.text) {
      allText += chunk.text;
    }
  }

  let title,
    shortDescription,
    description,
    topics: number[] = [];

  try {
    const parsedResponse = JSON.parse(allText);
    return {
      title: parsedResponse.title,
      shortDescription: parsedResponse.short_description || "",
      description: parsedResponse.description,
      topics: parsedResponse.topics,
    };
  } catch (error) {
    console.error("Error parsing LLM response:", error);
    title = "Enter Course Title";
    description =
      "Course description could not be automatically generated. Please edit this course to add details.";
    shortDescription = "";
    topics = [];
  }
  return {
    title,
    shortDescription,
    description,
    topics,
  };
}
