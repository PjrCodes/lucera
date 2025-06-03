"use client";

import React from "react";
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
        {/* <MobileNav /> */}
        <div className="flex flex-row items-center space-x-2">
          <Button
            className="h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon />
          </Button>
          <h1 className="text-3xl">{currentPage}</h1>
        </div>
        
        {isLoggedIn ? <div className="flex flex-row items-center justify-end space-x-2">
          <SearchBarElement />
          <IoMdNotifications
            size={32}
            className="cursor-pointer hover:text-gray-500"
          />
          <CiEdit size={32} className="cursor-pointer hover:text-gray-500" />
          <div className="flex justify-center">
            <ProfileCircle imageUrl={session?.user?.image} size={38} />
          </div>
        </div> : <SignIn/>}

      </div>
    </header>
  );
}
