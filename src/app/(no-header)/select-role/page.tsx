import React from "react";
import Form from "next/form";
import { auth, redirectUnauthenticated } from "@/lib/auth";
import client from "@/lib/db";
import { redirect } from "next/navigation";
import defaults from "@/appdata/defaults.json";
import { SecondaryButton } from "@/components/core/buttons/secondary";

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
  const db = client.db();
  const customUserDataCollection = db.collection("user_data");
  await customUserDataCollection.updateOne(
    { id: session.user.id },
    data.get("reason") === "newuser"
      ? {
          $set: {
            role: role,
            updatedAt: new Date(),
            dashboardLayout:
              role === "teacher"
                ? defaults.dashboardLayout.teacher
                : defaults.dashboardLayout.student,
            createdAt: new Date(),
            relatedCourses: [],
            relatedFiles: [],
          },
        }
      : {
          $set: {
            role: role,
            updatedAt: new Date(),
          },
        },
    { upsert: true }
  );

  return redirect((data.get("callbackUrl") as string) || "/");
}

// Accept searchParams as a prop to receive query parameters
export default async function SelectRolePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  // await searchParams
  const ourSearchParams = await searchParams;
  // restrict page to authenticated users only
  const session = await redirectUnauthenticated();

  // set role in the picker based on the database stored role
  let currentRole: string | null = null;
  if (session?.user?.id) {
    const db = client.db();
    const customUserDataCollection = db.collection("user_data");
    const userData = await customUserDataCollection.findOne({
      id: session.user.id,
    });
    currentRole = userData?.role ?? null;

    if (ourSearchParams?.reason === "newuser" && userData) {
      // If the user is new but user data already exists, then something is fishy.
      // Redirect to home page.
      return redirect("/");
    }
  }

  return (
    <main className="h-screen">
      <div className="max-w-md mx-auto my-12 p-8 border border-gray-200 rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Select Your Role</h1>
        <Form action={setUserRole} className="space-y-4">
          {/* Add hidden fields for each query param */}
          {ourSearchParams &&
            Object.entries(ourSearchParams).map(([key, value]) =>
              Array.isArray(value) ? (
                value.map((v, i) => (
                  <input key={key + i} type="hidden" name={key} value={v} />
                ))
              ) : (
                <input key={key} type="hidden" name={key} value={value ?? ""} />
              )
            )}
          <div>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="role"
                value="student"
                defaultChecked={currentRole === "student"}
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
            <SecondaryButton type="submit">
            Continue
            </SecondaryButton>
        </Form>
      </div>
    </main>
  );
}
