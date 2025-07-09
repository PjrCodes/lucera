import { Pinecone } from "@pinecone-database/pinecone";
import { ChatRequest } from "./schemas/api";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
});

export async function getPineconeIndex(indexName: string, host: string) {
  try {
    const index = pc.index(indexName, host);
    return index;
  } catch (error) {
    console.error("Error getting Pinecone index:", error);
    throw error;
  }
}

export async function addManySyllabusContent(
  ids: string[],
  texts: string[],
  courseId: string
) {
  try {
    const index = (
      await getPineconeIndex(
        "lucera",
        "https://lucera-hn4ejk3.svc.aped-4627-b74a.pinecone.io"
      )
    ).namespace("__default__");

    if (ids.length !== texts.length) {
      throw new Error("IDs and texts arrays must have the same length");
    }

    const records = ids.map((id, index) => ({
      _id: id,
      text: texts[index],
      courseId: courseId,
      contentType: "syllabus",
    }));

    const response = await index.upsertRecords(records);
    return response;
  } catch (error) {
    console.error("Error adding document to Pinecone:", error);
    throw error;
  }
}

export async function addManyCourseContent(
  ids: string[],
  texts: string[],
  courseId: string
) {
  try {
    const index = (
      await getPineconeIndex(
        "lucera",
        "https://lucera-hn4ejk3.svc.aped-4627-b74a.pinecone.io"
      )
    ).namespace("__default__");

    if (ids.length !== texts.length) {
      throw new Error("IDs and texts arrays must have the same length");
    }

    const records = ids.map((id, index) => ({
      _id: id,
      text: texts[index],
      courseId: courseId,
      contentType: "content",
    }));

    const response = await index.upsertRecords(records);
    return response;
  } catch (error) {
    console.error("Error adding document to Pinecone:", error);
    throw error;
  }
}

export async function retrieveDocuments(query: string, context: ChatRequest) {
  try {
    const index = (
      await getPineconeIndex(
        "lucera",
        "https://lucera-hn4ejk3.svc.aped-4627-b74a.pinecone.io"
      )
    ).namespace("__default__");

    const response = await index.searchRecords({
      query: {
        inputs: {
          text: query,
        },
        filter: {
          courseId: context.courseIds?.length
            ? { $in: context.courseIds }
            : undefined,
          contentType: context.contentTypes?.length
            ? { $in: context.contentTypes }
            : undefined,
        },
        topK: 8,
      },
    });

    // check if hits are hit enough, only then pass them on
    const hits = response.result.hits.filter(
      (hit) => hit._score && hit._score > 0.3
    );

    return hits;
  } catch (error) {
    console.error("Error retrieving documents from Pinecone:", error);
    throw error;
  }
}
