import React from "react";
import { redirectUnauthenticated } from "@/auth";
import { redirect } from "next/navigation";
import client from "@/lib/db";
import SetHeaderClientComponent from "./SetHeaderClientComponent"; // Added import
import SignOut from "@/components/buttons/signOutButton";
import { Link } from "lucide-react";

export default async function ProfilePage() {
  const session = await redirectUnauthenticated();

  // Define UserData type locally or import from a shared file
  type UserData = {
    id: string;
    role?: string;
  };

  // Ensure session and session.user exist before trying to access session.user.id
  if (!session?.user?.id) {
    // This case should ideally be handled by redirectUnauthenticated,
    // but as a fallback, redirect to login or an error page.
    return redirect("/"); // Or your login page
  }

  const userData: UserData | null = await client
    .db()
    .collection<UserData>("user_data")
    .findOne({ id: session.user.id }); // session.user.id is now guaranteed to be a string

  if (!userData) {
    // error - log out and show error message
    // alert("You need to select a role before accessing your profile."); // Remove alert for SSR
    return redirect("/select-role");
  }

  // Pass session and userData to the client component
  return (
    <>
      <SetHeaderClientComponent title="PROFILE" />
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
    </>
  );
}
