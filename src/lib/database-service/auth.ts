import client from "@/lib/db";
import {
  NotFoundError,
  InvalidDataError,
  InvalidCredentials,
} from "@/lib/errors";
import { userDataSchema } from "@/lib/schemas/database";
import { User } from "next-auth";
import { NextResponse } from "next/server";
import { NextAuthRequest } from "next-auth";
import { AuthenticatedSession } from "@/lib/types/auth";
import { auth } from "../auth";
import { redirect } from "next/navigation";

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
    throw new InvalidDataError(
      "Invalid user data format: " + parsedUser.error.message
    );
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

export function withTeacherSession(
  handler: (
    req: NextAuthRequest,
    session: AuthenticatedSession,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: Promise<any>
  ) => Promise<Response>
) {
  return async function (
    req: NextAuthRequest,
    ctx: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params: Promise<any>;
    }
  ) {
    if (!req.auth) {
      return NextResponse.json(
        { error: "Unauthorized: No authentication provided" },
        { status: 401 }
      );
    }
    const session = req.auth;
    if (!session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized: No user information found" },
        { status: 401 }
      );
    }
    try {
      if (!(await checkTeacherhood(session.user.id))) {
        return NextResponse.json(
          { error: "Forbidden: User is not a teacher" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Internal Error: Server error processing user data" },
        { status: 500 }
      );
    }

    return handler(req, session as AuthenticatedSession, ctx?.params);
  };
}

export function withAuthorisation(
  handler: (
    req: NextAuthRequest,
    session: AuthenticatedSession,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: Promise<any>
  ) => Promise<Response>
) {
  return async function (
    req: NextAuthRequest,
    ctx: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params: Promise<any>;
    }
  ) {
    if (!req.auth) {
      return NextResponse.json(
        { error: "Unauthorized: No authentication provided" },
        { status: 401 }
      );
    }
    const session = req.auth;
    if (!session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized: No user information found" },
        { status: 401 }
      );
    }

    return handler(req, session as AuthenticatedSession, ctx?.params);
  };
}

export async function serverSideRedirectUnauthenticated(): Promise<AuthenticatedSession> {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/");
  }
  return session as AuthenticatedSession;
}
