"use client";
import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <button
      onClick={() => signIn()}
      className="px-4 py-1 bg-black text-white rounded hover:bg-luceraoffwhite hover:text-black font-semibold transition"
    >
      Register / Sign In
    </button>
  );
}