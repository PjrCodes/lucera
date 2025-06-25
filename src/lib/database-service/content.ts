import { ObjectId } from "mongodb";
import client from "../db";
import { contentSchema } from "../schemas/database";
import { getCourseById } from "./courses";
import { getFileRecord } from "./files";

export async function getContentById(courseId: string) {
  const course = await client
    .db()
    .collection("content")
    .findOne({ _id: new ObjectId(courseId) });

  if (!course) {
    throw new Error("Course not found");
  }

  try {
    return contentSchema.parse(course);
  } catch (error) {
    console.error("Error parsing content:", error);
    throw new Error("Invalid content data format");
  }
}

export async function getContentForCourse(courseId: string) {
  const contents = await client
    .db()
    .collection("content")
    .find({ courseId: courseId })
    .toArray();
  const course_syllabus = await getCourseById(courseId);
  const syllabusFileID = course_syllabus.syllabusFileId;

  if (!syllabusFileID) {
    throw new Error("Syllabus file ID is missing for this course");
  }
  const syllabusFile = await getFileRecord(syllabusFileID);

  try {
    const parsedContents = await Promise.all(contents.map(async (content) => {
      const parsedData = contentSchema.parse(content);
      if (parsedData._id instanceof ObjectId) {
        parsedData._id = parsedData._id.toString();
      }

      // Get file details if fileId exists
      let fileDetails = null;
      if (parsedData.fileId) {
        try {
          const file = await getFileRecord(parsedData.fileId);
          fileDetails = {
            fileName: file.name,
            filePath: file.path,
            fileType: file.type,
            size: file.size,
            downloadUrl: `/api/files/download/${parsedData.fileId}`,
            viewUrl: `/api/files/view/${parsedData.fileId}`,
          };
        } catch (error) {
          console.error("Error fetching file details:", error);
        }
      }

      return {
        ...parsedData,
        file: fileDetails,
      };
    }));

    return {
      syllabus: {
        fileName: syllabusFile.name,
        filePath: syllabusFile.path,
        fileType: syllabusFile.type,
        size: syllabusFile.size,
        uploadDate: syllabusFile.createdAt,
        downloadUrl: `/api/files/download/${syllabusFileID}`,
        viewUrl: `/api/files/view/${syllabusFileID}`,
      },
      contents: parsedContents,
    };
  } catch (error) {
    console.error("Error parsing content:", error);
    throw new Error("Invalid content data format");
  }
}
