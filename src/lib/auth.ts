import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(client),
  debug: false,
  providers: [Google],
  pages: {
    newUser: "/select-role?reason=newuser", // Redirect to role selection page for new users
  },
});
