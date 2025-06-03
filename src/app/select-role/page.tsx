import React from "react";
import Form from "next/form";
import { auth } from "@/auth";
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
  
  if (!session?.user?.email) {
    // If no session, redirect to sign in
    return redirect("/api/auth/signin");
  }
  
  // Update the user's role in the database
  // The MongoDB adapter creates collections named "users", "accounts", etc.
  const db = client.db();
  const customUserDataCollection = db.collection("user_data");

  try {
    await customUserDataCollection.updateOne(
      { id: session.user.id }, // Use user ID from session
      { $set: { role: role } },
      { upsert: true } // Create a new document if it doesn't exist
    );  
    // Redirect to the home page after successful role assignment
  } catch (error) {
    console.error("Error updating user role:", error);
    throw new Error("Failed to update user role");
  }
  return redirect("/");
}

export default function SelectRolePage() {
  return (
    <main className="h-screen">
    <div className="max-w-md mx-auto my-12 p-8 border border-gray-200 rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Select Your Role</h1>
      <Form action={setUserRole} className="space-y-4">
        <div>
          <label className="inline-flex items-center">
            <input type="radio" name="role" value="student" defaultChecked className="mr-2" />
            Student
          </label>
        </div>
        <div>
          <label className="inline-flex items-center">
            <input type="radio" name="role" value="teacher" className="mr-2" />
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
