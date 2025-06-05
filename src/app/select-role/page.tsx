import React from "react";
import Form from "next/form";
import { auth, redirectUnauthenticated } from "@/auth";
import client from "@/lib/db";
import { redirect } from "next/navigation";

async function setUserRole(data: FormData) {
  "use server";
  const role = data.get("role");

  if (role !== "student" && role !== "teacher") {
    throw new Error("Invalid role selected");
  }
  
  // Get the current session - should exist after OAuth sign-in
  const session = await auth();
  if (!session?.user || !session.user.id) {
    // This code will not be reached.
    throw new Error("User not authenticated");
  }  

  // Update the user's role in the database
  // The MongoDB adapter creates collections named "users", "accounts", etc.
  const db = client.db();
  const customUserDataCollection = db.collection("user_data");

  try {
    await customUserDataCollection.updateOne(
      // Use user ID from session
      { id: session.user.id },
      {
        $set: {
          role: role,
          dashboardLayout:
        role === "student"
          ? {
          leftColumn: ["WHATS_NEXT", "PROGRESS", "YOUR_BADGES"],
          rightColumn: ["BOOKMARKS", "UPCOMING_DEADLINES"],
            }
          : {
          leftColumn: ["UPCOMING_DEADLINES", "PROGRESS", "STUDENT_ALERTS"],
          rightColumn: ["BOOKMARKS", "CREATE"],
            },
        },
      },
      { upsert: true }
    );  
    // Redirect to the profile page after successful role assignment
  } catch (error) {
    console.error("Error updating user role:", error);
    throw new Error("Failed to update user role");
  }
  return redirect("/profile");
}

export default async function SelectRolePage() {

  // restrict page to authenticated users only
  const session = await redirectUnauthenticated();

  // set role in the picker based on the database stored role
  let currentRole: string | null = null;
  if (session?.user?.id) {
    const db = client.db();
    const customUserDataCollection = db.collection("user_data");
    const userData = await customUserDataCollection.findOne({ id: session.user.id });
    currentRole = userData?.role ?? null;
  }

  return (
    <main className="h-screen">
    <div className="max-w-md mx-auto my-12 p-8 border border-gray-200 rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Select Your Role</h1>
      <Form action={setUserRole} className="space-y-4">
        <div>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="role"
              value="student"
              defaultChecked={currentRole === "student" || !currentRole}
              className="mr-2"
            />
            Student
          </label>
        </div>
        <div>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="role"
              value="teacher"
              defaultChecked={currentRole === "teacher"}
              className="mr-2"
            />
            Teacher
          </label>
        </div>
        <button type="submit" className="px-4 py-2 bg-black text-white rounded hover:bg-lucerayellow hover:text-black font-semibold transition">
          Continue
        </button>
      </Form>
    </div>
    </main>
  );
}
