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
  courseId: string,
) {
  try {
    const index = (
      await getPineconeIndex(
        "lucera",
        "https://lucera-hn4ejk3.svc.aped-4627-b74a.pinecone.io",
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

    if (records.length === 0) {
      return {
        error: "No records to add to Pinecone",
      }
    }


    const response = await index.upsertRecords(records);
    return response;
  } catch (error) {
    console.error("Error adding document to Pinecone:", error);
    return {
      error: "Failed to add documents to Pinecone",
    }
  }
}

export async function addManyCourseContent(
  ids: string[],
  texts: string[],
  courseId: string,
  metadata?: { blockChatbot?: boolean; contentId?: string }
) {
  try {
    const index = (
      await getPineconeIndex(
        "lucera",
        "https://lucera-hn4ejk3.svc.aped-4627-b74a.pinecone.io",
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
      blockChatbot: metadata?.blockChatbot || false,
      ...(metadata?.contentId && { contentId: metadata.contentId }),
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
        "https://lucera-hn4ejk3.svc.aped-4627-b74a.pinecone.io",
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
          blockChatbot: { $ne: true }, // Exclude documents that block chatbot
        },
        topK: 8,
      },
    });

    // check if hits are hit enough, only then pass them on
    const hits = response.result.hits.filter(
      (hit) => hit._score && hit._score > 0.3,
    );

    return hits;
  } catch (error) {
    console.error("Error retrieving documents from Pinecone:", error);
    throw error;
  }
}

export async function updateContentSecurityMetadata(
  contentId: string,
  blockChatbot: boolean
) {
  try {
    // Get the content record to find associated chunks
    const { ObjectId } = await import('mongodb');
    const client = (await import('./db')).default;
    const db = client.db();

    const content = await db.collection("content").findOne({
      _id: new ObjectId(contentId)
    });

    if (!content || !content.extractedChunks) {
      console.log(`No chunks found for content ${contentId}`);
      return { success: true, updatedChunks: 0 };
    }

    // Get the index
    const index = (
      await getPineconeIndex(
        "lucera",
        "https://lucera-hn4ejk3.svc.aped-4627-b74a.pinecone.io",
      )
    ).namespace("__default__");

    // Update each chunk's metadata
    let updatedCount = 0;
    for (const chunkId of content.extractedChunks) {
      try {
        // Get the chunk to preserve its text
        const chunk = await db.collection("extracted_chunks").findOne({
          _id: new ObjectId(chunkId)
        });

        if (chunk) {
          // Update in Pinecone with new security metadata
          await index.upsertRecords([{
            _id: chunkId,
            text: chunk.text,
            courseId: content.courseId,
            contentType: "content",
            blockChatbot: blockChatbot,
            contentId: contentId,
          }]);
          updatedCount++;
        }
      } catch (error) {
        console.error(`Error updating chunk ${chunkId}:`, error);
      }
    }

    console.log(`Updated security metadata for ${updatedCount} chunks of content ${contentId}: blockChatbot=${blockChatbot}`);
    return { success: true, updatedChunks: updatedCount };
  } catch (error) {
    console.error("Error updating content security metadata in Pinecone:", error);
    throw error;
  }
}

export async function updateAssignmentSecurityMetadata(
  assignmentId: string,
  blockChatbot: boolean
) {
  try {
    // Get the assignment record to find associated chunks
    const { ObjectId } = await import('mongodb');
    const client = (await import('./db')).default;
    const db = client.db();

    const assignment = await db.collection("assignment").findOne({
      _id: new ObjectId(assignmentId)
    });

    if (!assignment || !assignment.extractedChunks) {
      console.log(`No chunks found for assignment ${assignmentId}`);
      return { success: true, updatedChunks: 0 };
    }

    // Get the index
    const index = (
      await getPineconeIndex(
        "lucera",
        "https://lucera-hn4ejk3.svc.aped-4627-b74a.pinecone.io",
      )
    ).namespace("__default__");

    // Update each chunk's metadata
    let updatedCount = 0;
    for (const chunkId of assignment.extractedChunks) {
      try {
        // Get the chunk to preserve its text
        const chunk = await db.collection("extracted_chunks").findOne({
          _id: new ObjectId(chunkId)
        });

        if (chunk) {
          // Update in Pinecone with new security metadata
          await index.upsertRecords([{
            _id: chunkId,
            text: chunk.text,
            courseId: assignment.courseId,
            contentType: "assignment",
            blockChatbot: blockChatbot,
            assignmentId: assignmentId,
          }]);
          updatedCount++;
        }
      } catch (error) {
        console.error(`Error updating chunk ${chunkId}:`, error);
      }
    }

    console.log(`Updated security metadata for ${updatedCount} chunks of assignment ${assignmentId}: blockChatbot=${blockChatbot}`);
    return { success: true, updatedChunks: updatedCount };
  } catch (error) {
    console.error("Error updating assignment security metadata in Pinecone:", error);
    throw error;
  }
}
