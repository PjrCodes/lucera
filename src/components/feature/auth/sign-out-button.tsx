"use client";
import { signOut } from "next-auth/react";
import { SecondaryButton } from "../../core/buttons/secondary";

export default function SignOut() {
  return (
    <SecondaryButton onClick={() => signOut()}>
      Sign Out
    </SecondaryButton>
  );
}
