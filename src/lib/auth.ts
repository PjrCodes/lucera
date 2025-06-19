import NextAuth, { Session } from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/db";
import { redirect } from "next/navigation";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(client),
  debug: false,
  providers: [
    Google,
  ],
  pages: {
    newUser: "/select-role?reason=newuser", // Redirect to role selection page for new users
  },
});

/**
 * Redirects unauthenticated users to the home page.
 *
 * This function checks if there is a valid user session. If no user is found in the session,
 * it redirects the user to the root path ("/"). If the user is authenticated, the session object is returned.
 *
 * @returns The current session if authenticated; otherwise, the function redirects.
 */
export async function redirectUnauthenticated(): Promise<Session | undefined> {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  return session;
}
