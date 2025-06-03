import React from "react";
import { auth } from "@/auth";
import Link from "next/link";
import { MdDashboard, MdChat, MdTrendingUp, MdLightbulb, MdMessage, MdSettings } from "react-icons/md";

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
            <Link href="/" className="flex items-center gap-3 px-4 py-2 text-black hover:bg-yellow-200 rounded-md transition-colors">
              <MdDashboard size={20} />
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/lisa" className="flex items-center gap-3 px-4 py-2 text-black hover:bg-yellow-200 rounded-md transition-colors">
              <MdChat size={20} />
              LISA
            </Link>
          </li>
          <li>
            <Link href="/progress" className="flex items-center gap-3 px-4 py-2 text-black hover:bg-yellow-200 rounded-md transition-colors">
              <MdTrendingUp size={20} />
              Progress
            </Link>
          </li>
          <li>
            <Link href="/lighthouse" className="flex items-center gap-3 px-4 py-2 text-black hover:bg-yellow-200 rounded-md transition-colors">
              <MdLightbulb size={20} />
              Lighthouse
            </Link>
          </li>
          <li>
            <Link href="/messages" className="flex items-center gap-3 px-4 py-2 text-black hover:bg-yellow-200 rounded-md transition-colors">
              <MdMessage size={20} />
              Messages
            </Link>
          </li>
        </ul>
      </div>

      <div className="px-4 py-4 border-t border-yellow-600">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-black hover:bg-yellow-200 rounded-md transition-colors mb-4">
          <MdSettings size={20} />
          Settings
        </Link>
        <div className="px-4 text-sm">
          Powered by Lucera
        </div>
      </div>

    </nav>
  );
};
