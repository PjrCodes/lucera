"use client";
import { signIn } from "next-auth/react";
import { PrimaryButton } from "@/components/core/buttons/primary";

export default function SignIn() {
  return (
    <PrimaryButton onClick={() => signIn()}>Register / Sign In</PrimaryButton>
  );
}
