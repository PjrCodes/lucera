"use client";
import { signOut } from "next-auth/react";

export default function SignOut() {
  return (
    <button
      onClick={() => signOut()}
      className="px-4 py-1 bg-black text-white rounded hover:bg-luceraoffwhite hover:text-black font-semibold transition"
    >
      Sign Out
    </button>
  );
}