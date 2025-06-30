import React from "react";
import {
  getSessionAndUserData,
} from "@/lib/database-service/auth";
import SetHeaderClientComponent from "../../../components/feature/header/set-header-client-component"; // Added import
import SignOut from "@/components/feature/auth/sign-out-button";
import Link from "next/link";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { Edit } from "lucide-react";

export default async function ProfilePage() {
  const { session, userData } = await getSessionAndUserData();
  // Pass session and userData to the client component
  return (
    <>
      <SetHeaderClientComponent title="PROFILE" />
      <main className="h-screen w-full flex flex-col px-4 py-4">
        <div className="flex flex-col w-full h-full gap-4 items-center justify-center">
          <div className="space-y-3 text-lg rounded-lg flex flex-col items-start justify-center p-8 w-full max-w-xl">
            <p>
              <span className="font-semibold">Name:</span> {session.user.name}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {session.user.email}
            </p>
            <p>
              <span className="font-semibold">Role:</span>{" "}
              {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
              <SecondaryButton variant="outline" className="ml-2" asChild>
                <Link
                  href="/select-role"
                  className="text-blue-500 hover:underline text-lg"
                >
                  <Edit className="inline" />
                </Link>
              </SecondaryButton>
            </p>
            <div className="flex flex-row gap-4 items-center justify-start w-full">
              <SignOut />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
