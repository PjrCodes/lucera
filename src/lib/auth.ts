import NextAuth, { Session } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/db";
import { redirect } from "next/navigation";
import { saltAndHashPassword } from "@/lib/password";
import { addUserToDb, getUserFromDb } from "./database/auth";
import { InvalidCredentials } from "./errors";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(client),
  debug: false,
  providers: [
    Google,
    Credentials({
      credentials: {
        name: {
          type: "text",
          label: "Name",
          placeholder: "John Doe",
        },
        email: {
          type: "email",
          label: "Email",
          placeholder: "johndoe@gmail.com",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "*****",
        },
      },
      authorize: async (credentials) => {
        let user = null;

        // logic to salt and hash password
        const pwHash = saltAndHashPassword(credentials.password);

        // logic to verify if the user exists
        try {
          user = await getUserFromDb(credentials.email, pwHash);
        } catch (error) {
          if (error instanceof InvalidCredentials) {
            throw error;
          }
        }
        if (!user) {
          // No user found, so this is their first attempt to login
          user = {
            email: credentials.email,
            name: credentials.name,
            image: null,
          };

          await addUserToDb(user, pwHash);

        }
        // return user object with their profile data

        const userInterfaceObj = {
          name: user.name,
          email: user.email,
          image: user.image || null,
        }
        return userInterfaceObj;
      },
    }),
  ],
  callbacks: {
     async session({ session, token, user }) {
      if (token) {
        session.id = token.id
      }
      return session
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.id = user.id
      }

      return token
    },
  },
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
