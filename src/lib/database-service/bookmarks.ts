import client from "../db";
import { getRelevantMiniDetails } from "./common";
import { ObjectId } from "mongodb";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  type: "assignment" | "content" | "course";
  subtitle: string;
};

export async function createBookmark(
  userId: string,
  bookmarkType: Bookmark["type"],
  relatedId: string
) {
  const relevantMiniDetails = await getRelevantMiniDetails(
    bookmarkType,
    relatedId
  );
  await client.db().collection("bookmarks").insertOne({
    userId,
    type: bookmarkType,
    relatedId,
    createdAt: new Date(),
  });

  return relevantMiniDetails;
}

export async function getBookmarks(userId: string): Promise<Bookmark[]> {
  const db = client.db();
  const bookmarks = await db.collection("bookmarks").find({ userId }).toArray();
  if (bookmarks.length === 0) {
    return [];
  }
  const bookmarkDetails = await Promise.all(
    bookmarks.map(async (bookmark) => {
      const miniDetails = await getRelevantMiniDetails(
        bookmark.type,
        bookmark.relatedId
      );
      return {
        id: bookmark._id ? bookmark._id.toString() : String(Math.random()),
        title: miniDetails.title,
        url: bookmark.type != "content" ? `/view/${bookmark.type}/${bookmark.relatedId}` : `/`,
        type: bookmark.type,
        subtitle: miniDetails.subtitle,
      };
    })
  );
  return bookmarkDetails;
}

export async function deleteBookmark(userId: string, bookmarkId: string) {
  const db = client.db();
  const result = await db.collection("bookmarks").deleteOne({
    userId,
    _id: new ObjectId(bookmarkId),
  });

  if (result.deletedCount === 0) {
    throw new Error(
      "Bookmark not found or you do not have permission to delete it."
    );
  }

  return true;
}

export async function isBookmarked(
  userId: string,
  bookmarkType: Bookmark["type"],
  relatedId: string
): Promise<boolean> {
  const db = client.db();
  const bookmark = await db.collection("bookmarks").findOne({
    userId,
    type: bookmarkType,
    relatedId,
  });
  return !!bookmark;
}
