"use server";

import React from "react";
import { redirect } from "next/navigation";
import { serverComponentRedirectUnauthenticated } from "@/lib/database-service/auth";
import client from "@/lib/db";
import SelectRoleForm from "@/components/feature/profile/select-role-form";

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
      // Do not load the form.
      redirect("/");
    }
  }

  return (
    <main className="h-screen">
      <div className="max-w-md mx-auto my-12 p-8 border border-gray-200 rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Select Your Role</h1>
        <SelectRoleForm
          searchParams={ourSearchParams}
          currentRole={currentRole}
        />
      </div>
    </main>
  );
}
