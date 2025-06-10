"use client";
import React from "react";
import { Session } from "next-auth";
import { iconForType } from "@/constants";
import { MdBookmarkBorder } from "react-icons/md";

interface Bookmark {
  id: number;
  title: string;
  url: string;
  type: "assignment" | "content" | "report" | "poll" | "link" | "quiz"; // Added 'quiz' for variety
  subtitle: string;
}

interface Props {
  session: Session | null;
  isTeacher: boolean;
}

const Bookmarks: React.FC<Props> = ({ session, isTeacher }) => {
  // Dummy data for bookmarks - replace with actual data fetching later
  const bookmarks: Bookmark[] = [
    {
      id: 1,
      title: "Summative assignment: Design Document",
      url: "https://example.com/assignment-design-doc",
      type: "assignment",
      subtitle: "Resilience"
    },
    {
      id: 2,
      title: "Summative quiz: Test your knowledge",
      url: "https://example.com/quiz-resilience",
      type: "quiz", // Assuming 'quiz' type exists or maps to a suitable icon
      subtitle: "Resilience"
    },
    {
      id: 3,
      title: "Summative Assessment quiz: The Lake Poets",
      url: "https://example.com/quiz-lake-poets",
      type: "quiz",
      subtitle: "English: The Lake Poets"
    },
    {
      id: 4,
      title: "Course Materials: Week 5",
      url: "https://example.com/materials-week5",
      type: "content",
      subtitle: "Introduction to Programming"
    }
  ];

  return (
    <div className="bg-lucerapurple-1 rounded-lg shadow-md p-4 md:px-6 min-h-[300px] flex flex-col">
      <div className="flex items-center justify-start mb-4">
        <h2 className="text-lg font-bold text-lucerapurple-5">BOOKMARKS</h2>
        {/* Removed Add New button */}
      </div>
      {bookmarks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-lucerapurple-4">
          <MdBookmarkBorder className="text-5xl" />
          <p className="text-lg">No bookmarks yet.</p>
          <p className="text-sm text-lucerapurple-3 text-center">
            You can add bookmarks from various parts of the application.
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-3 flex-1"> {/* Changed to flex column list */}
          {bookmarks.map((bm) => (
            <a
              key={bm.id}
              href={bm.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/80 rounded-lg shadow p-3 hover:shadow-lg transition-shadow flex items-center space-x-3" // Item styling
            >
              <div className="text-lucerapurple-4 text-2xl"> {/* Icon styling */}
                {React.createElement(iconForType(bm.type))}
              </div>
              <div className="flex-1 overflow-hidden"> {/* Container for text, allows truncation */}
                <h3
                  className="font-semibold text-lucerapurple-5 truncate"
                  title={bm.title}
                >
                  {bm.title}
                </h3>
                <p
                  className="text-sm text-lucerapurple-4 truncate"
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

export default Bookmarks;
