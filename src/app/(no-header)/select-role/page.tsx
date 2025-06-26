"use server";

import React from "react";
import { serverComponentRedirectUnauthenticated } from "@/lib/database-service/auth";
import client from "@/lib/db";
import { redirect } from "next/navigation";
import SelectRoleClient from "../../../components/feature/profile/select-role-client";
import defaults from "@/appdata/defaults.json";
import { z } from "zod";

const setUserRoleSchema = z.object({
  role: z.enum(["student", "teacher"], {
    required_error: "Please select a role",
    invalid_type_error: "Invalid role selected",
  }),
  reason: z.string().optional(),
  callbackUrl: z.string().optional(),
});

export type FormState = {
  errors?: {
    role?: string[];
    reason?: string[];
    callbackUrl?: string[];
  };
  message?: string;
  success?: boolean;
};

export async function setUserRole(
  prevState: FormState,
  data: FormData
): Promise<FormState> {
  "use server";

  // Let Zod handle FormData directly
  const parsedData = setUserRoleSchema.safeParse(
    Object.fromEntries(data.entries())
  );
  if (!parsedData.success) {
    return {
      errors: parsedData.error.flatten().fieldErrors,
      message: "Validation failed",
      success: false,
    };
  }

  try {
    const session = await serverComponentRedirectUnauthenticated();

    // Update the user's role in the database
    const db = client.db();
    const customUserDataCollection = db.collection("user_data");
    await customUserDataCollection.updateOne(
      { id: session.user.id },
      parsedData.data.reason === "newuser"
        ? {
            $set: {
              role: parsedData.data.role,
              dashboardLayout:
                parsedData.data.role === "teacher"
                  ? defaults.dashboardLayout.teacher
                  : defaults.dashboardLayout.student,
              createdAt: new Date(),
              updatedAt: new Date(),
              relatedCourses: [],
              relatedFiles: [],
            },
          }
        : {
            $set: {
              role: parsedData.data.role,
              updatedAt: new Date(),
            },
          },
      { upsert: true }
    );

    redirect(parsedData.data.callbackUrl || "/");
  } catch (error) {
    // if eerror is NEXT_REDIRECT then throw it
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    
    console.error("Database error:", error);
    return {
      message: "Failed to update user role. Please try again.",
      success: false,
    };
  }
}

// Server component for data fetching and rendering the client component
export default async function SelectRolePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ourSearchParams = await searchParams;
  // restrict page to authenticated users only
  const session = await serverComponentRedirectUnauthenticated();

  // set role in the picker based on the database stored role
  let currentRole: string | null = null;
  if (session.user.id) {
    const db = client.db();
    const customUserDataCollection = db.collection("user_data");
    const userData = await customUserDataCollection.findOne({
      id: session.user.id,
    });
    currentRole = userData?.role ?? null;

    if (ourSearchParams?.reason === "newuser" && userData) {
      // If the user is new but user data already exists, then something is fishy.
      // Redirect to home page.
      redirect("/");
    }
  }

  return (
    <main className="h-screen">
      <div className="max-w-md mx-auto my-12 p-8 border border-gray-200 rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Select Your Role</h1>
        <SelectRoleClient
          searchParams={ourSearchParams}
          currentRole={currentRole}
        />
      </div>
    </main>
  );
}








