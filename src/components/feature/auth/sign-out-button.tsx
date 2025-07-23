"use client";
import { signOut } from "next-auth/react";
// import { SecondaryButton } from "@/components/core/buttons/secondary";
import { PrimaryButton } from "@/components/core/buttons/primary";

export default function SignOut() {
  return <PrimaryButton onClick={() => signOut()}>Sign Out</PrimaryButton>;
}
