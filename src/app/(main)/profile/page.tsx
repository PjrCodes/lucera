import React from "react";
import { getSessionAndUserData } from "@/lib/database-service/auth";
import SetHeaderClientComponent from "../../../components/feature/header/set-header-client-component";
import SignOut from "@/components/feature/auth/sign-out-button";
import Link from "next/link";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { Edit, User } from "lucide-react";
import { PrimaryButton } from "@/components/core/buttons/primary";

export default async function ProfilePage() {
  const { session, userData } = await getSessionAndUserData();

  return (
    <>
      <SetHeaderClientComponent title="PROFILE" />
      <main className="min-h-screen bg-transparent p-4">
        <div className="space-y-4 md:space-y-6">
          {/* Simplified Header matching other pages */}
          <div className="flex flex-col gap-4 bg-white rounded-xl shadow-sm border border-primary-200 p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary-700" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary-800">
                  Profile
                </h1>
                <p className="text-primary-600/80 text-xs sm:text-sm">
                  Manage your account information and settings
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-4 md:p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="border-b border-primary-200 pb-4">
                  <h2 className="text-lg font-semibold text-primary-800 mb-1">
                    Account Information
                  </h2>
                  <p className="text-primary-600/70 text-sm">
                    Your personal details and account settings
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 px-4 bg-primary-50/50 rounded-lg border border-primary-100">
                    <div>
                      <label className="text-sm font-medium text-primary-700">
                        Name
                      </label>
                      <p className="text-base text-primary-800 font-medium">
                        {session.user.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 px-4 bg-primary-50/50 rounded-lg border border-primary-100">
                    <div>
                      <label className="text-sm font-medium text-primary-700">
                        Email
                      </label>
                      <p className="text-base text-primary-800 font-medium">
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 px-4 bg-primary-50/50 rounded-lg border border-primary-100">
                    <div>
                      <label className="text-sm font-medium text-primary-700">
                        Role
                      </label>
                      <p className="text-base text-primary-800 font-medium">
                        {userData.role.charAt(0).toUpperCase() +
                          userData.role.slice(1)}
                      </p>
                    </div>
                    <PrimaryButton
                      variant="outline"
                      className="mt-2 sm:mt-0"
                      asChild
                    >
                      <Link
                        href="/select-role"
                        className="flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Change Role</span>
                      </Link>
                    </PrimaryButton>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="border-t border-primary-200 pt-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <SignOut />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
