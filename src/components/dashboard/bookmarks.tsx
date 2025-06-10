"use client";
import React, { useState } from "react";
import { Session } from "next-auth";

interface Bookmark {
  id: number;
  title: string;
  url: string;
  type: "assignment" | "content" | "report" | "poll" | "link";
  icon: string;
}

interface Props {
  session: Session | null;
  isTeacher: boolean;
}

const Bookmarks: React.FC<Props> = ({ session, isTeacher }) => {
  const getIconForType = (type: string): string => {
    switch (type) {
      case "assignment":
        return "📝";
      case "content":
        return "📚";
      case "report":
        return "📊";
      case "poll":
        return "🗳️";
      default:
        return "🔗";
    }
  };

  // Dummy data for bookmarks - replace with actual data fetching later
  const dummyBookmarks: Bookmark[] = [
    {
      id: 1,
      title: "Course Materials",
      url: "https://example.com/materials",
      type: "content",
      icon: getIconForType("content")
    },
    {
      id: 2,
      title: "Online Textbook",
      url: "https://example.com/textbook",
      type: "content",
      icon: getIconForType("content")
    },
    {
      id: 3,
      title: "Assignment Portal",
      url: "https://example.com/assignments",
      type: "assignment",
      icon: getIconForType("assignment")
    },
    {
      id: 4,
      title: "Student Performance Report",
      url: "https://example.com/reports/performance",
      type: "report",
      icon: getIconForType("report")
    },
    {
      id: 5,
      title: "Weekly Poll",
      url: "https://example.com/polls/week5",
      type: "poll",
      icon: getIconForType("poll")
    }
  ];

  const [bookmarks, setBookmarks] = useState(dummyBookmarks);

  const handleAddBookmark = () => {
    const title = prompt("Enter bookmark title:");
    if (!title) return;

    const url = prompt("Enter bookmark URL:");
    if (!url) return;

    const typeInput = prompt(
      "Enter bookmark type (assignment, content, report, poll, link):"
    );
    const type = (typeInput?.toLowerCase() || "link") as Bookmark["type"];
    const icon = getIconForType(type);

    setBookmarks([...bookmarks, { id: Date.now(), title, url, type, icon }]);
  };

  return (
    <div className="bg-lucerapurple-1 rounded-lg shadow-md p-4 md:p-6 min-h-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-lucerapurple-5">BOOKMARKS</h2>
        <button
          className="bg-lucerapurple-4 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-lucerapurple-5 transition-colors"
          onClick={handleAddBookmark}
        >
          + Add New
        </button>
      </div>
      {bookmarks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-lucerapurple-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mb-2 text-lucerapurple-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <p className="text-lg">No bookmarks yet.</p>
          <p className="text-sm text-lucerapurple-3">
            Click "+ Add New" to create one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
          {bookmarks.map((bm) => (
            <a
              key={bm.id}
              href={bm.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow flex flex-col items-start text-left"
            >
              <div className="text-3xl mb-2">{bm.icon}</div>
              <h3
                className="font-semibold text-lucerapurple-5 mb-1 truncate w-full"
                title={bm.title}
              >
                {bm.title}
              </h3>
              <p className="text-xs text-lucerapurple-4 bg-lucerapurple-1 px-2 py-0.5 rounded-full capitalize">
                {bm.type}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
