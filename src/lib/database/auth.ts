import client from "@/lib/db";
import { NotFoundError, InvalidDataError, InvalidCredentials } from "@/lib/errors";
import { userDataSchema } from "@/lib/schemas";
import { User } from "next-auth";

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

export async function getUserFromDb(email: unknown, password: string) {
  const db = client.db();
  const user = await db.collection("users").findOne({
    email: email,
    password: password,
  });

  console.log("User found:", user);

  if (!user) {
    return null; // User not found
  }
  if (user.password === undefined && password) {
    // If the user exists but has no password, return null
    throw new InvalidCredentials("User has no password set");
  }
  if (user.password !== password) {
    // If the password does not match, return null
    throw new InvalidCredentials("Invalid credentials provided");
  }
  return user;
}

export async function addUserToDb(user: User, password: string) {
  const db = client.db();
  const result = await db.collection("users").insertOne({
    ...user,
    password: password,
  });
  return result;
}
