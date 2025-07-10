import { GoogleGenAI, Type } from "@google/genai";
import { ChatRequest } from "../schemas/api";
import fs from "fs";
import { retrieveDocuments } from "../pinecone";
import { Hit } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_data";
import { Course } from "../schemas/database";
import { getCourseById } from "../database-service/courses";
// import { chunkit } from 'semantic-chunking';
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const queryAugmentationUserPrompt = fs.readFileSync(
  "./src/appdata/prompts/query_augmentation/user.txt",
  "utf-8",
);

const chatUserPrompt = fs.readFileSync(
  "./src/appdata/prompts/chatbot/user.txt",
  "utf-8",
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
    const parsedResponse = JSON.parse(llmTextResponse);
    if (parsedResponse.augmentedQuery) {
      query = parsedResponse.augmentedQuery;
    } else {
      console.error("No augmented query found in LLM response");
      throw new Error("Failed to augment query with synonyms");
    }
  } catch (error) {
    console.error("Error during LLM call:", error);
    throw new Error("Failed to augment query with synonyms");
  }

  return query;
}

async function getLisasResponse(
  query: string,
  documents: string[],
): Promise<string> {
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
        answer: {
          type: Type.STRING,
        },
      },
    },
  };
  const model = "gemini-2.5-flash";
  const LLMPrompt = chatUserPrompt
    .replace("{{USER_QUERY}}", query)
    .replace(
      "{{DOCUMENTS}}",
      documents.map((doc) => `\n- ${doc}`).join("\n--------------\n"),
    );
  console.log("LLMPrompt:", LLMPrompt);
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: LLMPrompt,
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

  try {
    const parsedResponse = JSON.parse(llmTextResponse);
    return parsedResponse.answer || "";
  } catch (error) {
    console.error("Error parsing LLM response:", error);
    throw new Error("Failed to parse LLM response");
  }
}

async function getDocData(hits: Hit[]): Promise<string[]> {
  // retrieve actual document text from hit.id
  const docs = [];
  const relevantCourses = new Set<string>();
  for (const hit of hits) {
    const fields = hit.fields as {
      courseId: string;
      text: string;
      contentType: string;
    };
    relevantCourses.add(fields.courseId);
    docs.push({
      text: fields.text || "",
      courseId: fields.courseId,
      contentType: fields.contentType,
    });
  }

  console.log("[LISA] Retrieved Documents:", docs.length, "documents");

  // ping relevantCourses
  const courseDataMap = new Map<string, Course>();
  for (const courseId of relevantCourses) {
    if (courseDataMap.has(courseId)) {
      continue; // Skip if already fetched
    }
    const course = await getCourseById(courseId);
    if (course) {
      courseDataMap.set(courseId, course);
    } else {
      console.warn(`Course with ID ${courseId} not found`);
    }
  }

  // add preface to document - COURSE NAME, ETC.
  const finalDocs: string[] = docs.map((doc) => {
    const relevantCourse = courseDataMap.get(doc.courseId);
    const courseName = relevantCourse ? relevantCourse.name : "Unknown Course";
    return `Course: ${courseName} | Content Type: ${doc.contentType}\n${doc.text}`;
  });

  console.log("[LISA] Final Documents:", finalDocs.length, "documents");

  return finalDocs;
}

export async function callLisa(context: ChatRequest) {
  console.log("CONTEXT PAYLOAD:", context);
  const query = await synonymAugmentation(context.query);
  console.log("AUGMENTED QUERY:", query);
  // pinecone search with metadata filtering
  const hits = await retrieveDocuments(query, context);
  console.log("VECTOR SEARCH HITS:", hits);
  const docData = await getDocData(hits);
  // console.log("DOCUMENT DATA:", docData);
  // Call LLM with documents to answer user query.
  const answer = await getLisasResponse(query, docData);
  console.log("LLM ANSWER:", answer);

  // For now, we will return a mock response
  return { answer };
}

export async function reChunkOnWordCount(
  textArray: string[],
  count: number = 1000,
): Promise<string[]> {
  const allText = textArray.join(" ");
  const words = allText.split(/\s+/);

  const allChunks: string[] = [];
  let currentChunk: string[] = [];
  let currentWordCount = 0;
  for (const word of words) {
    if (currentWordCount + word.length > count) {
      // If adding this word exceeds the count, save the current chunk
      allChunks.push(currentChunk.join(" "));
      currentChunk = [word]; // Start a new chunk with the current word
      currentWordCount = word.length; // Reset the count to the length of the current word
    } else {
      // Otherwise, add the word to the current chunk
      currentChunk.push(word);
      currentWordCount += word.length + 1; // +1 for the space
    }
  }

  // If there's any remaining chunk, add it to the list
  if (currentChunk.length > 0) {
    allChunks.push(currentChunk.join(" "));
  }

  console.log("[RECHUNKER] Chunked into: ", allChunks.length, "chunks");
  return allChunks;
}
