"use client";

import React, { useState } from "react";
import SearchBarElement from "./SearchBarElement";
import { IoMdNotifications } from "react-icons/io";
import { CiEdit } from "react-icons/ci";
import ProfileCircle from "./profileCircle";
import SignIn from "./buttons/signInButton";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { SidebarIcon } from "lucide-react";

export default function Header() {
  const session = useSession().data;
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const [searchExpanded, setSearchExpanded] = useState(false);

  const isLoggedIn = session?.user ? true : false;

  // Dynamically set currentPage based on the current route
  let currentPage = "";
  if (isLoggedIn) {
    if (pathname) {
      if (pathname === "/") {
        currentPage = "Dashboard";
      } else {
        const segments = pathname.split("/").filter(Boolean);
        currentPage =
          segments.length > 0
            ? segments[segments.length - 1]
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : "Knowhere.";
      }
    }
  } else {
    currentPage = "Lucera";
  }

  return (
    <header className="border-b border-yellow-600 sticky top-0 z-50 w-full bg-lucerayellow backdrop-blur-lg supports-[backdrop-filter]:bg-lucerayellow">
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
          {/* Heading: show on mobile only if search is not expanded, always show on sm+ */}
          {!searchExpanded && (
            <h1 className="text-xl md:text-3xl sm:hidden">{currentPage}</h1>
          )}
          <h1 className="hidden sm:block text-xl md:text-3xl">{currentPage}</h1>
        </div>
        {isLoggedIn ? (
          <div className={`flex flex-row items-center space-x-2 flex-1 ${searchExpanded ? "justify-center sm:justify-end" : "justify-end"}`}>
            {/* Search bar: on mobile, flex-1 when expanded */}
            <div className={`${searchExpanded ? "flex-1 max-w-full" : ""} sm:static`}>
              <SearchBarElement expanded={searchExpanded} setExpanded={setSearchExpanded} />
            </div>
            {/* Notification icon: hide on mobile when searchExpanded */}
            <span className={`${searchExpanded ? "hidden" : "inline"} sm:inline`}>
              <IoMdNotifications
                size={32}
                className="cursor-pointer hover:text-gray-500"
              />
            </span>
            {/* Edit icon: always hidden on mobile */}
            <span className="hidden sm:inline">
              <CiEdit size={32} className="cursor-pointer hover:text-gray-500" />
            </span>
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
