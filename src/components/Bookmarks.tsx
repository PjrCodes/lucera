"use client";
import React, { useState } from "react";

interface Bookmark {
  id: number;
  title: string;
  url: string;
}

interface Props {
  bookmarks: Bookmark[];
}

const Bookmarks: React.FC<Props> = ({ bookmarks: initialBookmarks }) => {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);

  const handleAddBookmark = () => {
    const title = prompt("Enter bookmark title:");
    const url = prompt("Enter bookmark URL:");
    if (title && url) {
      setBookmarks([...bookmarks, { id: Date.now(), title, url }]);
    }
  };

  return (
    <div className="bg-purple-50 rounded shadow p-4 min-h-[220px] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-bold text-purple-900">Bookmarks</h2>
        <button
          className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700"
          onClick={handleAddBookmark}
        >
          + Add Bookmark
        </button>
      </div>
      <ul className="flex-1">
        {bookmarks.map((bm) => (
          <li key={bm.id} className="mb-1">
            <a
              href={bm.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 underline"
            >
              {bm.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Bookmarks;
