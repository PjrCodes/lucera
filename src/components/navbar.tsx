import React from "react";
import { auth } from "@/auth";
import SignIn from "./buttons/signInButton";
import ProfileCircle from "./profileCircle";
import Link from "next/link";

export default async function Navbar() {
  const session = await auth();
  const isLoggedIn = session?.user ? true : false;
  return (
    <nav className="bg-lucerayellow px-6 py-3 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-black text-2xl font-bold tracking-wide">
          <Link href="/" className="hover:underline">
          Lucera
          </Link>
        </div>
        <ul className="flex space-x-6 items-center">
          <li>
            {isLoggedIn ? (
              <ProfileCircle imageUrl={session?.user?.image}/>
            ) : (
              <SignIn />
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};
