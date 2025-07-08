import { Pinecone } from "@pinecone-database/pinecone";

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

export async function addCourseContent(
  id: string,
  text: string,
  category: string,
  courseId: string | null = null
) {
  try {
    const index = (
      await getPineconeIndex(
        "lucera",
        "https://lucera-hn4ejk3.svc.aped-4627-b74a.pinecone.io"
      )
    ).namespace("__default__");
    const response = await index.upsertRecords([
      courseId
        ? {
            id: id,
            text: text,
            category: category,
            courseId: courseId,
          }
        : {
            id: id,
            text: text,
            category: category,
          },
    ]);
    return response;
  } catch (error) {
    console.error("Error adding document to Pinecone:", error);
    throw error;
  }
}
