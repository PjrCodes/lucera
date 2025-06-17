import client from "@/lib/db";
import { NotFoundError, InvalidDataError } from "@/lib/errors";
import { userDataSchema } from "@/lib/schemas";

export async function getUserData(userId: string) {
  const db = client.db();
  const user = await db.collection("user_data").findOne({ id: userId });
  if (!user) {
    throw new NotFoundError("User");
  }

  // Validate the user data against the schema
  const parsedUser = userDataSchema.safeParse(user);

  if (!parsedUser.success) {
    console.error("Invalid user data format:", parsedUser.error);
    throw new InvalidDataError("Invalid user data format");
  }

  // remove the _id field from the parsed user data
  delete parsedUser.data._id;
  return parsedUser.data;
}

export async function checkTeacherhood(userId: string) {
  const user = await getUserData(userId);
  return user.role === "teacher";
}
