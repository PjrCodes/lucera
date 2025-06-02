import React from "react";
import { auth } from "@/auth";
import SignIn from "./buttons/signInButton";
import SignOut from "./buttons/signOutButton";

export default async function Navbar() {
  const session = await auth();
  const isLoggedIn = session?.user ? true : false;

  return (
    <nav className="bg-blue-700 px-6 py-3 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-white text-2xl font-bold tracking-wide">
          Lucera
        </div>
        <ul className="flex space-x-6 items-center">
          <li>
            {isLoggedIn ? (
              <SignOut />
            ) : (
              <SignIn />
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};
