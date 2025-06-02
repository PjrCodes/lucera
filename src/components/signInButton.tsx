"use client";
import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <button
      onClick={() => signIn("google")}
      className="px-4 py-1 bg-white text-blue-700 rounded hover:bg-blue-100 font-semibold transition"
    >
      Sign in with Google
    </button>
  );
}