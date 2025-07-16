"use client";

import React, { useState, useEffect } from "react";
import SearchBarElement from "./search-bar-element";
import ProfileCircle from "./profile-circle";
import SignIn from "@/components/feature/auth/sign-in-button";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../../ui/sidebar";
import { Home, SidebarIcon, SquarePen } from "lucide-react";
import Link from "next/link";
import { Session } from "next-auth";
import Bell from "./bell";
import { useHeader } from "@/components/feature/header/header-context";
import DashboardEditModal from "../dashboard/dashboard-edit-modal";
import type { UserData } from "@/lib/schemas/database"; // Adjust the import path as needed

// Accept session as a prop instead of fetching it on the client
export default function Header({
  session,
  userData,
}: {
  session: Session | null;
  userData: UserData | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Add edit modal state
  const { headerTitle, setHeaderTitle } = useHeader(); // Consuming header context

  const isLoggedIn = session?.user ? true : false;
  const isHomePage = pathname === "/";
  const isLisaPage = pathname === "/lisa";

  // Set default header title if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setHeaderTitle("LUCERA");
    }
    // If logged in, pages should set their own titles.
    // As a fallback, or for pages not yet updated, we can set a default title here.
    else if (isHomePage) {
      setHeaderTitle("DASHBOARD");
    }
    // Add other general fallbacks if necessary
    else {
      setHeaderTitle("LUCERA"); // Default title for other pages
    }
  }, [isLoggedIn, isHomePage, setHeaderTitle, pathname]);

  // Handler for search submit
  const handleSearch = (query: string) => {
    if (query && query.trim()) {
      router.push(`/lisa?question=${encodeURIComponent(query.trim())}`);
      setSearchExpanded(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-primary-50">
      <div className="px-4 py-4 h-14 flex flex-row items-center justify-between">
        {/* Sidebar button always visible */}
        <div className="flex flex-row items-center space-x-2 flex-shrink-0">
          <div
            className="cursor-pointer rounded-lg p-1 transition hover:bg-secondary-50"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <SidebarIcon size={24} />
          </div>
          {isLoggedIn && !isHomePage && (
            <Link
              href="/"
              className="cursor-pointer rounded-lg p-1 transition hover:bg-secondary-50"
              aria-label="Go Home"
            >
              <Home size={24} />
            </Link>
          )}
          {/* Heading: only render once, hide/show with CSS */}
          <h1
            className={`font-header text-xl md:text-2xl tracking-wider font-bold truncate max-w-[10rem] sm:max-w-[20dvw] md:max-w-[33dvw] lg:max-w-[45dvw] ${
              searchExpanded ? "hidden sm:block" : "block"
            }`}
          >
            {headerTitle}
            {/* Remove character limit logic, use CSS truncation */}
          </h1>
        </div>
        {isLoggedIn ? (
          <div
            className={`flex flex-row items-center space-x-2 flex-1 ${
              searchExpanded ? "justify-center sm:justify-end" : "justify-end"
            }`}
          >
            {/* Search bar: on mobile, flex-1 when expanded */}
            {!isLisaPage && (
              <div
                className={`${
                  searchExpanded ? "flex-1 max-w-full" : ""
                } sm:static`}
              >
                <SearchBarElement
                  expanded={searchExpanded}
                  setExpanded={setSearchExpanded}
                  onSearch={handleSearch}
                />
              </div>
            )}
            {/* Notification icon: hide on mobile when searchExpanded */}
            <span
              className={`${searchExpanded ? "hidden" : "inline"} sm:inline`}
            >
              <Bell></Bell>
            </span>
            {/* Edit icon: only show on Dashboard and never on mobile */}
            {isHomePage && (
              <span className="hidden sm:inline">
                <div
                  className={
                    "cursor-pointer rounded-lg p-1 transition hover:bg-secondary-50 text-black"
                  }
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <SquarePen size={24} />
                </div>
              </span>
            )}
            <div className="flex justify-center p-1 hover:bg-secondary-50 rounded-lg">
              <ProfileCircle imageUrl={session?.user?.image} size={24} />
            </div>
          </div>
        ) : (
          <SignIn />
        )}
      </div>

      {/* Add Dashboard Edit Modal */}
      <DashboardEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={userData!}
        userId={session?.user?.id || ""} // Pass userId from session
      />
    </header>
  );
}
