import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";


const syllabusUserPrompt = fs.readFileSync(
  "./data/prompts/syllabus_extractor/user.txt",
  "utf-8"
);
const syllabusSystemPrompt = fs.readFileSync(
  "./data/prompts/syllabus_extractor/system.txt",
  "utf-8"
);  


interface LLMSyllabusParseResponse {
  name: string;
  description: string;
  units: string[];
  timeline: string[];
  courseStartDate: Date;
  courseEndDate: Date;
  shortDescription: string;
}

export async function LLMSyllabusParse(
  filePath: string
): Promise<LLMSyllabusParseResponse> {
  // save the text to a file for debugging purposes
  const result = await callAI(filePath);

  return {
    name: result.name,
    description: result.description,
    units: result.units,
    timeline: result.timeline,
    courseStartDate: result.courseStartDate,
    courseEndDate: result.courseEndDate,
    shortDescription: result.shortDescription || "",
  };
}

async function callAI(filePath: string) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
   const config = {
    thinkingConfig: {
      thinkingBudget: 0,
    },
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      required: ["units", "timeline", "name", "description", "start_date", "end_date", "short_description"],
      properties: {
        units: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["name", "description"],
            properties: {
              name: {
                type: Type.STRING,
              },
              description: {
                type: Type.STRING,
              },
            },
          },
        },
        timeline: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["type", "title", "start_date", "due_date", "grade_release_date", "start_date_inferred", "due_date_inferred", "grade_release_date_inferred"],
            properties: {
              type: {
                type: Type.STRING,
                enum: ["assignment", "quiz", "midsem_exam", "endsem_exam", "exam", "lab_exam", "other", "project", "case study", "tutorial or workshop", "field trip", "guest lecture"],
              },
              title: {
                type: Type.STRING,
              },
              start_date: {
                type: Type.STRING,
              },
              due_date: {
                type: Type.STRING,
              },
              grade_release_date: {
                type: Type.STRING,
              },
              start_date_inferred: {
                type: Type.BOOLEAN,
              },
              due_date_inferred: {
                type: Type.BOOLEAN,
              },
              grade_release_date_inferred: {
                type: Type.BOOLEAN,
              },
            },
          },
        },
        name: {
          type: Type.STRING,
        },
        course_code: {
          type: Type.STRING,
        },
        description: {
          type: Type.STRING,
        },
        start_date: {
          type: Type.STRING,
        },
        end_date: {
          type: Type.STRING,
        },
        short_description: {
          type: Type.STRING,
        },
      },
    },
    systemInstruction: [
        {
          text: syllabusSystemPrompt,
        }
    ],
  };
  const model = "gemini-2.5-flash-preview-05-20";
  const contents = [
    {
      role: "user",
      parts: [
        {
          inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            filename: "syllabus.pdf",
            mimeType: `application/pdf`,
          },
        },
        {
          text: syllabusUserPrompt
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  // process response text as json
  let allText = "";
  for await (const chunk of response) {
    if (chunk.text) {
      allText += chunk.text;
    }
  }
  try {
    const parsedResponse = JSON.parse(allText);
    return {
      name: parsedResponse.name,
      description: parsedResponse.description,
      shortDescription: parsedResponse.short_description || "",
      units: parsedResponse.units,
      timeline: parsedResponse.timeline,
      courseStartDate: new Date(parsedResponse.start_date),
      courseEndDate: new Date(parsedResponse.end_date),
    };
  } catch (error) {
    console.error("Error parsing AI response:", error);
    throw new Error("Failed to parse AI response");
  }
}





// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

