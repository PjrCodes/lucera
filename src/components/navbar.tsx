import React from "react";
import { auth } from "@/auth";
import Link from "next/link";

export default async function Navbar() {
  const session = await auth();
  const isLoggedIn = session?.user ? true : false;

  if (!isLoggedIn) {
    return (
      <nav className="bg-lucerayellow w-64 h-screen fixed left-0 top-0 shadow-lg flex flex-col">
        <div className="px-6 py-4 border-b border-yellow-600">
          <div className="text-black text-2xl font-bold tracking-wide">
            <Link href="/" className="hover:underline">
              Your University
            </Link>
          </div>
        </div>
        <div className="flex-1 px-4 py-6">
          <p className="text-black">Please log in to access Lucera.</p>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-lucerayellow w-64 h-screen fixed left-0 top-0 shadow-lg flex flex-col">
      <div className="px-6 py-4 border-b border-yellow-600">
        <div className="text-black text-2xl font-bold tracking-wide">
          <Link href="/" className="hover:underline">
            Your University
          </Link>
        </div>
      </div>
      
      <div className="flex-1 px-4 py-6">
        <ul className="space-y-4">
          <li>
            <Link href="/" className="block px-4 py-2 text-black hover:bg-yellow-200 rounded-md transition-colors">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/lisa" className="block px-4 py-2 text-black hover:bg-yellow-200 rounded-md transition-colors">
              LISA
            </Link>
          </li>
          <li>
            <Link href="/progress" className="block px-4 py-2 text-black hover:bg-yellow-200 rounded-md transition-colors">
              Progress
            </Link>
          </li>
          <li>
            <Link href="/lighthouse" className="block px-4 py-2 text-black hover:bg-yellow-200 rounded-md transition-colors">
              Lighthouse
            </Link>
          </li>
          <li>
            <Link href="/messages" className="block px-4 py-2 text-black hover:bg-yellow-200 rounded-md transition-colors">
              Messages
            </Link>
          </li>
        </ul>
      </div>

      <div className="px-4 py-4 border-t border-yellow-600">
        <Link href="/settings" className="block px-4 py-2 text-black hover:bg-yellow-200 rounded-md transition-colors mb-4">
          Settings
        </Link>
        <div className="px-4 text-sm">
          Powered by Lucera
        </div>
      </div>

    </nav>
  );
};
