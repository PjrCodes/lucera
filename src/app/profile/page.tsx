import React from "react";
import { auth } from "@/auth";
import SignOut from "@/components/buttons/signOutButton";
import { redirect } from "next/navigation";
import client from "@/lib/db";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();
  const isLoggedIn = session?.user ? true : false;
  type UserData = {
    id: string;
    role?: string;
  };

  const userData: UserData | null = await client
    .db()
    .collection<UserData>("user_data")
    .findOne({ id: session?.user?.id });

  if (isLoggedIn && !userData) {
    // error - log out and show error message
    // alert("You need to select a role before accessing your profile."); // Remove alert for SSR
    return redirect("/select-role");
  }
  if (!isLoggedIn) {
    return redirect("/");
  }

  return (
    <main className="h-screen w-full flex flex-col px-4 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl">Your Profile</h1>
      </div>
      <div className="flex flex-col w-full h-full gap-4 items-center justify-center">
        <div className="space-y-3 text-lg rounded-lg flex flex-col items-start justify-center p-8 w-full max-w-xl">
          <p>
            <span className="font-semibold">Name:</span>{" "}
            {session?.user?.name || "Unknown User"}
          </p>
          <p>
            <span className="font-semibold">Email:</span>{" "}
            {session?.user?.email || "No email provided"}
          </p>
          <p>
            <span className="font-semibold">Role:</span>{" "}
            {userData?.role || "Role not set"}
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
  );
}
