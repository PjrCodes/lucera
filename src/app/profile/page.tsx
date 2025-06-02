import React from "react";
import { auth } from "@/auth";
import SignOut from "@/components/buttons/signOutButton";
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth();
  const isLoggedIn = session?.user ? true : false;

  if (!isLoggedIn) {
    return redirect("/");
  }

  return (
    <div className="max-w-xl mx-auto my-8 p-8 border border-gray-200 rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="mt-6 space-y-3">
        <p>
          <span className="font-semibold">Name:</span> {session?.user?.name || "Unknown User"}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {session?.user?.email || "No email provided"}
        </p>
        <p>
          <span className="font-semibold">Role:</span> {session?.user?.role || "No role assigned"}
        </p>
      </div>
      <div className="mt-8">
        <SignOut />
      </div>
    </div>
  );
}
