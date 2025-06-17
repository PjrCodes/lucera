import React from "react";
import { redirectUnauthenticated } from "@/auth";
import client from "@/lib/db";
import SetHeaderClientComponent from "../../../components/set-header-client-component"; // Added import
import SignOut from "@/components/core/buttons/sign-out-button";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await redirectUnauthenticated();

  type UserData = {
    id: string;
    role?: string;
  };

  const userData: UserData | null = await client
    .db()
    .collection<UserData>("user_data")
    .findOne({ id: session?.user?.id });

  if (!userData) {
    throw new Error("User data not found");
  }

  // Pass session and userData to the client component
  return (
    <>
      <SetHeaderClientComponent title="PROFILE" />
      <main className="h-screen w-full flex flex-col px-4 py-4">
        <div className="flex flex-col w-full h-full gap-4 items-center justify-center">
          <div className="space-y-3 text-lg rounded-lg flex flex-col items-start justify-center p-8 w-full max-w-xl">
            <p>
              <span className="font-semibold">Name:</span>{" "}
              {session?.user?.name || "How are you here?"}
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {session?.user?.email || "You need to Log In!"}
            </p>
            <p>
              <span className="font-semibold">Role:</span>{" "}
              {userData?.role || "You need to select a role!"}
            </p>

            <SignOut />
            <Link
              href="/select-role"
              className="text-blue-500 hover:underline text-lg"
            >
              Change Role
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
