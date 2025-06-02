"use client";
import { signOut } from "next-auth/react";

export default function SignOut() {
  return (
    <button
      onClick={() => signOut()}
      className="px-4 py-1 bg-white text-blue-700 rounded hover:bg-blue-100 font-semibold transition"
    >
      Sign Out
    </button>
  );
}