"use client";

import React, { useState } from "react";
import SearchBarElement from "./searchBarElement";
import { CiEdit } from "react-icons/ci";
import ProfileCircle from "./profileCircle";
import SignIn from "./buttons/signInButton";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { SidebarIcon } from "lucide-react";
import { IoMdHome } from "react-icons/io";
import Link from "next/link";
import { Session } from "next-auth";
import Bell from "./bell";

// Accept session as a prop instead of fetching it on the client
export default function Header({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const [searchExpanded, setSearchExpanded] = useState(false);

  const isLoggedIn = session?.user ? true : false;
  const isHomePage = pathname === "/";
  const isLisaPage = pathname === "/lisa";

  // Dynamically set currentPage based on the current route
  let currentPage = "";
  if (isLoggedIn) {
    if (pathname) {
      if (pathname === "/") {
        currentPage = "DASHBOARD";
      } else {
        const segments = pathname.split("/").filter(Boolean);
        currentPage =
          segments.length > 0
            ? segments[segments.length - 1]
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())
                .toUpperCase()
            : "KNOWHERE.";
      }
    }
  } else {
    currentPage = "LUCERA";
  }

  // Handler for search submit
  const handleSearch = (query: string) => {
    if (query && query.trim()) {
      router.push(`/lisa?question=${encodeURIComponent(query.trim())}`);
      setSearchExpanded(false);
    }
  };

  return (
    <header className="border-b border-yellow-600 sticky top-0 z-50 w-full bg-lucerayellow-3/50 backdrop-blur-lg supports-[backdrop-filter]:bg-lucerayellow-3/50">
      <div className="px-4 py-4 h-14 flex flex-row items-center justify-between">
        {/* Sidebar button always visible */}
        <div className="flex flex-row items-center space-x-2 flex-shrink-0">
          <Button
            className="h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon />
          </Button>
          {isLoggedIn && !isHomePage && (
            <Link href="/" passHref>
              <Button
                className="h-8 w-8"
                variant="ghost"
                size="icon"
                tabIndex={-1}
              >
                <IoMdHome size={20} />
              </Button>
            </Link>
          )}
          {/* Heading: only render once, hide/show with CSS */}
          <h1
            className={`text-xl md:text-2xl tracking-wider font-bold ${
              searchExpanded ? "hidden sm:block" : "block"
            }`}
          >
            {currentPage}
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
            {currentPage === "Dashboard" && (
              <span className="hidden sm:inline">
                <CiEdit
                  size={32}
                  className="cursor-pointer hover:text-gray-500"
                />
              </span>
            )}
            <div className="flex justify-center">
              <ProfileCircle imageUrl={session?.user?.image} size={38} />
            </div>
          </div>
        ) : (
          <SignIn />
        )}
      </div>
    </header>
  );
}
