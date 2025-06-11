"use client";
import { signOut } from "next-auth/react";

export default function SignOut() {
  return (
    <button
      onClick={() => signOut()}
      className="px-4 py-1 bg-lucerabrown-1 text-lucerabrown-5 rounded hover:bg-lucerabrown-4 hover:text-white font-semibold transition cursor-pointer border-lucerabrown-5 border-2"
    >
      Sign Out
    </button>
  );
}