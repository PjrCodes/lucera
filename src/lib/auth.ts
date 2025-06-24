import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/db";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(client),
  debug: false,
  providers: [Google],
  pages: {
    newUser: "/select-role?reason=newuser", // Redirect to role selection page for new users
  },
});

type AuthenticatedSession = Session & { user: { id: string } };

export async function serverSideRedirectUnauthenticated(): Promise<AuthenticatedSession> {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/");
  }
  return session as AuthenticatedSession;
}
