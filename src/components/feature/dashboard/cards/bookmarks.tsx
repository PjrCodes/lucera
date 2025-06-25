"use client";
import React from "react";
import { iconForType } from "@/lib/constants";
import { MdBookmarkBorder } from "react-icons/md";
import { PropsForEveryDashboardCard } from "@/lib/interfaces";

interface Bookmark {
  id: number;
  title: string;
  url: string;
  type: "assignment" | "content" | "report" | "poll" | "link" | "quiz"; // Added 'quiz' for variety
  subtitle: string;
}

export default function Bookmarks({ }: PropsForEveryDashboardCard) {
  // Dummy data for bookmarks - replace with actual data fetching later
  const bookmarks: Bookmark[] = [

  ];

  return (
    <div className="bg-primary-100 rounded-lg shadow-md p-4 md:px-6 min-h-[300px] flex flex-col">
      <div className="flex items-center justify-start mb-4">
        <h2 className="text-lg font-bold text-primary-700">BOOKMARKS</h2>
      </div>
      {bookmarks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-primary-700">
          <MdBookmarkBorder className="text-5xl" />
          <p className="text-lg">No bookmarks yet.</p>
          <p className="text-sm text-primary-600 text-center">
            You can add bookmarks from various parts of the application.
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-3 flex-1">
          {bookmarks.map((bm) => (
            <a
              key={bm.id}
              href={bm.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/80 rounded-lg shadow p-3 hover:shadow-lg transition-shadow flex items-center space-x-3"
            >
              <div className="text-primary-700 text-2xl">
                {React.createElement(iconForType(bm.type))}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3
                  className="font-semibold text-primary-700 truncate"
                  title={bm.title}
                >
                  {bm.title}
                </h3>
                <p
                  className="text-sm text-primary-600 truncate"
                  title={bm.subtitle}
                >
                  {bm.subtitle}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
