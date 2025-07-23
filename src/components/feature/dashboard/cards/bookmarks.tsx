import React from "react";
import { iconForType } from "@/lib/constants";
import { MdBookmarkBorder } from "react-icons/md";
import { SessionAndDataProps } from "@/lib/interfaces/props";
import { getBookmarks } from "@/lib/database-service/bookmarks";
import { BookMarked } from "lucide-react";

export default async function Bookmarks({ userData }: SessionAndDataProps) {
  const bookmarks = await getBookmarks(userData.id);

  return (
    <div className="border-2 border-primary-100 rounded-lg shadow-md p-4 md:px-6 min-h-[300px] flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
          <BookMarked className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
        </div>
        <div className="flex flex-col text-sm sm:text-base text-primary-700">
          <h2 className="font-bold text-primary-700 gap-2 text-lg">
            Bookmarks
          </h2>
          <p className="text-primary-500">{bookmarks.length} bookmark(s)</p>
        </div>
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
        <div className="flex-1 flex flex-col items-center justify-start space-y-2">
          {bookmarks.map((bm) => (
            <a
              key={bm.id}
              href={bm.url}
              className="bg-primary-100/40 rounded-lg shadow p-3 hover:shadow-md transition-shadow w-full"
            >
              <div className="text-primary-700 text-2xl">
                {React.createElement(iconForType(bm.type))}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-semibold text-primary-700" title={bm.title}>
                  {bm.title}
                </h3>
                <p className="text-sm text-primary-600 line-clamp-1" title={bm.subtitle}>
                  {bm.subtitle}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
