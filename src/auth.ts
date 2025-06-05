import NextAuth, { Session } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/db";
import { redirect } from "next/navigation";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(client),
  debug: false,
  providers: [
    Google,
    Credentials({
      id: "CREDS",
      name: "🔐 MEGA SUPER CREDS DELUXE™",
      credentials: {
        emailButCooler: {
          label: "📧 Your Digital Soul Address",
          type: "email",
          placeholder: "human@existence.void",
        },
        secretSauce: {
          label: "🔑 Password of Ultimate Power",
          type: "password",
          placeholder: "••••••••••••••••••••••••",
        },
      },
      async authorize(credentials) {
        // 🎭 The MEGA WEIRD credential validation dance begins
        const { emailButCooler, secretSauce } = credentials || {};

        // Triple nested ternary because we're rebels 😎
        const isEmailValid =
          emailButCooler && emailButCooler.includes("@")
            ? emailButCooler.length > 5
              ? true
              : false
            : false;

        // Password must contain the letter 'a' because why not? 🤷‍♂️
        const secretSauceContainsTheLetterA = secretSauce
          ?.toString()
          .toLowerCase()
          .includes("a");

        if (!isEmailValid || !secretSauceContainsTheLetterA) {
          console.log(
            "🚫 CREDS REJECTED: Missing the magic 'a' or invalid soul address"
          );
          return null;
        }

        // Create a user object with unnecessarily complex property names
        const ultraMegaUserObject = {
          id: `CREDS_USER_${Date.now()}_${Math.random().toString(36).substr(
            2,
            9
          )}`,
          email: emailButCooler,
          name:
            emailButCooler?.split("@")[0].toUpperCase() +
            " THE CREDENTIALED",
          image: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${emailButCooler}`,
          role: ["admin", "user", "wizard", "potato"][
            Math.floor(Math.random() * 4)
          ],
        };

        console.log("✨ CREDS MAGIC ACTIVATED:", ultraMegaUserObject.name);
        return ultraMegaUserObject;
      },
    }),
  ],
  pages: {
    newUser: "/select-role", // Redirect to role selection page for new users
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