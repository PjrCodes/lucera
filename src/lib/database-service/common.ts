import { ObjectId } from "mongodb";
import client from "../db";

export async function getRelevantMiniDetails(type: string, id: string) {
  const db = client.db();

  switch (type) {
    case "assignment": {
      const assignment = await db
        .collection("assignment")
        .findOne({ _id: new ObjectId(id) });
      if (!assignment) {
        throw new Error("Assignment not found");
      }
      return {
        id,
        title: assignment.title,
        subtitle: assignment.description?.substring(0, 100) + "..." || "No description",
      };
    }
    case "content": {
      const content = await db
        .collection("content")
        .findOne({ _id: new ObjectId(id) });
      if (!content) {
        throw new Error("Content not found");
      }
      return {
        id,
        title: content.title,
        subtitle: content.description?.substring(0, 100) + "..." || "No description",
      };
    }
    case "course": {
      const course = await db
        .collection("courses")
        .findOne({ _id: new ObjectId(id) });
      if (!course) {
        throw new Error("Course not found");
      }
      return {
        id,
        title: course.name,
        subtitle: course.shortDescription || course.description?.substring(0, 100) + "..." || "No description",
      };
    }
  }

  return {
    id,
    title: `Mini Details for ${type} with ID ${id}`,
    subtitle: `Subtitle for ${type} with ID ${id}`,
  };
}
