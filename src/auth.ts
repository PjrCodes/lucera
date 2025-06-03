import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(client),
  debug: true,
  providers: [
    Google,
    // Google({
    //   profile(profile) {
    //     return {
    //       id: profile.id,
    //       name: profile.name,
    //       email: profile.email,
    //       image: profile.picture,
    //       firstName: profile.given_name,
    //       lastName: profile.family_name,
    //       role: profile.role || null, // Add role if available
    //     };
    //   },
    // }),
  ],
  // callbacks: {
  //   session: async ({ session, user }) => {
  //     // Attach user role to session
  //     session.user.role = user.role || null; // Ensure role is included in the session
  //     return session;
  //   }
  // },
  pages: {
    newUser: "/select-role", // Redirect to role selection page for new users
  }
});
