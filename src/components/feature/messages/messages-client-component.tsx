"use client";

import SetHeaderClientComponent from "@/components/feature/header/set-header-client-component";
import { UserData } from "@/lib/schemas/database";
import { AuthenticatedSession } from "@/lib/types/auth";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  FaBullhorn,
  FaEnvelope,
  FaChevronRight,
  FaPaperPlane,
  FaChevronDown,
} from "react-icons/fa";

const announcements = [
  {
    id: 1,
    title: "Exam Schedule Released",
    content:
      "The final exam schedule is now available. Please check the portal.",
    date: "2024-06-10",
    from: "Prof. Smith",
    course: "Computer Science 101",
  },
  {
    id: 2,
    title: "Assignment Deadline Extended",
    content: "The deadline for Assignment 3 has been extended by 2 days.",
    date: "2024-06-08",
    from: "Dr. Lee",
    course: "Data Structures",
  },
];

const dms = [
  {
    id: 1,
    from: "Prof. Smith",
    message: "Please see me after class tomorrow.",
    date: "2024-06-09",
    unread: true,
  },
  {
    id: 2,
    from: "Dr. Lee",
    message: "Your project proposal looks good.",
    date: "2024-06-07",
    unread: false,
  },
];

const professors: Record<string, { name: string; img: string }> = {
  "Prof. Smith": {
    name: "Prof. Smith",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  "Dr. Lee": {
    name: "Dr. Lee",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },
};

// Mock DM history
const dmHistoryInit: Record<
  number,
  { from: string; message: string; date: string }[]
> = {
  1: [
    {
      from: "Prof. Smith",
      message: "Please see me after class tomorrow.",
      date: "2024-06-09",
    },
    { from: "You", message: "Sure, Prof. Smith!", date: "2024-06-09" },
  ],
  2: [
    {
      from: "Dr. Lee",
      message: "Your project proposal looks good.",
      date: "2024-06-07",
    },
    { from: "You", message: "Thank you!", date: "2024-06-07" },
  ],
};

const sidebarItems = [
  {
    key: "announcements",
    label: "Announcements",
    icon: <FaBullhorn />,
  },
  {
    key: "dms",
    label: "Direct Messages",
    icon: <FaEnvelope />,
  },
];

export default function MessagesClientComponent({}: {
  session: AuthenticatedSession;
  userData: UserData;
}) {
  const [selected, setSelected] = useState<"announcements" | "dms">(
    "announcements"
  );
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
    number | null
  >(null);
  const [selectedDmId, setSelectedDmId] = useState<number | null>(null);
  const [dmHistory, setDmHistory] = useState(dmHistoryInit);
  const [dmInput, setDmInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat on new message
  useEffect(() => {
    if (chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [selectedDmId, dmHistory]);

  return (
    <>
      <SetHeaderClientComponent title={"MESSAGES"} />
      <div className="w-full max-w-6xl mx-auto p-0 md:p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[80vh] flex flex-col md:flex-row">
          {/* Mobile Tab Bar */}
          <nav className="flex md:hidden sticky top-0 z-10 bg-secondary-50 border-b border-secondary-200">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setSelected(item.key as "announcements" | "dms");
                  setSelectedAnnouncementId(null);
                  setSelectedDmId(null);
                }}
                className={`flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium transition-all duration-200 ${
                  selected === item.key
                    ? "bg-secondary-100 text-secondary-800 border-b-2 border-secondary-500"
                    : "text-secondary-700 hover:bg-secondary-100"
                }`}
              >
                <span
                  className={`text-lg mb-1 ${
                    selected === item.key
                      ? "text-secondary-600"
                      : "text-secondary-400"
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.key === "announcements" && announcements.length > 0 && (
                  <span className="bg-secondary-300 text-secondary-50 text-xs px-2 py-0.5 rounded-full font-medium mt-1">
                    {announcements.length}
                  </span>
                )}
                {item.key === "dms" &&
                  dms.filter((dm) => dm.unread).length > 0 && (
                    <span className="bg-secondary-300 text-secondary-50 text-xs px-2 py-0.5 rounded-full font-medium mt-1">
                      {dms.filter((dm) => dm.unread).length}
                    </span>
                  )}
              </button>
            ))}
          </nav>
          {/* Sidebar for md+ */}
          <aside className="hidden md:flex w-64 bg-secondary-50 border-r border-secondary-200 flex-col">
            <div className="p-6 border-b border-secondary-200">
              <h1 className="text-2xl font-bold text-secondary-700">
                Messages
              </h1>
            </div>
            <nav className="flex-1 p-4">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setSelected(item.key as "announcements" | "dms");
                    setSelectedAnnouncementId(null);
                    setSelectedDmId(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-left transition-all duration-200 ${
                    selected === item.key
                      ? "cursor-pointer bg-secondary-100 text-secondary-800 font-medium border border-secondary-400"
                      : "cursor-pointer text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900 border border-transparent"
                  }`}
                >
                  <span
                    className={`text-lg ${
                      selected === item.key
                        ? "text-secondary-600"
                        : "text-secondary-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.key === "announcements" && announcements.length > 0 && (
                    <span className="bg-secondary-300 text-secondary-50 text-xs px-2 py-1 rounded-full font-medium">
                      {announcements.length}
                    </span>
                  )}
                  {item.key === "dms" &&
                    dms.filter((dm) => dm.unread).length > 0 && (
                      <span className="bg-secondary-300 text-secondary-50 text-xs px-2 py-1 rounded-full font-medium">
                        {dms.filter((dm) => dm.unread).length}
                      </span>
                    )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-gray-50 relative min-h-[60vh] p-2 md:p-6">
            {/* Announcements List */}
            {selected === "announcements" && (
              <section className="h-full overflow-y-auto">
                <div className="mb-4 md:mb-6">
                  <h2 className="text-xl font-semibold text-secondary-700 mb-2">
                    Announcements
                  </h2>
                  <p className="text-secondary-500 text-sm">
                    Stay updated with the latest announcements from your
                    instructors
                  </p>
                </div>
                <div className="space-y-2 md:space-y-3">
                  {announcements.map((a) => (
                    <div
                      key={a.id}
                      className="bg-white rounded-lg border border-primary-200 overflow-hidden transition-all duration-200"
                    >
                      {/* Announcement Header */}
                      <div
                        className={`p-3 md:p-4 cursor-pointer hover:bg-primary-50 transition-colors ${
                          selectedAnnouncementId === a.id
                            ? "bg-primary-50 border-b border-primary-200"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedAnnouncementId(
                            selectedAnnouncementId === a.id ? null : a.id
                          )
                        }
                      >
                        <div className="flex items-start gap-2 md:gap-3">
                          <Image
                            src={professors[a.from]?.img}
                            alt={a.from}
                            width={40}
                            height={40}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-primary-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-medium text-secondary-900 text-xs md:text-sm">
                                {a.title}
                              </h3>
                              {selectedAnnouncementId === a.id ? (
                                <FaChevronDown className="text-secondary-400 text-xs mt-1 flex-shrink-0 transition-transform" />
                              ) : (
                                <FaChevronRight className="text-secondary-400 text-xs mt-1 flex-shrink-0 transition-transform" />
                              )}
                            </div>
                            <p className="text-secondary-600 text-xs md:text-sm mb-2 line-clamp-2">
                              {a.content}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-secondary-500">
                              <span>{a.from}</span>
                              <span>•</span>
                              <span>{a.course}</span>
                              <span>•</span>
                              <span suppressHydrationWarning>
                                {new Date(a.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Announcement Expanded Content */}
                      {selectedAnnouncementId === a.id && (
                        <div className="px-3 md:px-4 pb-3 md:pb-4 bg-primary-50">
                          <div className="bg-white rounded-lg p-4 md:p-6 border border-primary-100">
                            <div className="mb-2 md:mb-4">
                              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                                {a.title}
                              </h3>
                              <div className="flex items-center gap-2 text-xs md:text-sm text-secondary-600 mb-2 md:mb-4">
                                <span className="font-medium">{a.from}</span>
                                <span>•</span>
                                <span>{a.course}</span>
                                <span>•</span>
                                <span suppressHydrationWarning>
                                  {new Date(a.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="prose prose-sm max-w-none">
                              <div className="text-secondary-700 leading-relaxed">
                                {a.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* DMs List */}
            {selected === "dms" && selectedDmId === null && (
              <section className="h-full overflow-y-auto">
                <div className="mb-4 md:mb-6">
                  <h2 className="text-xl font-semibold text-secondary-700 mb-2">
                    Direct Messages
                  </h2>
                  <p className="text-secondary-500 text-sm">
                    Private conversations with your instructors
                  </p>
                </div>
                <div className="space-y-2 md:space-y-3">
                  {dms.map((dm) => (
                    <div
                      key={dm.id}
                      className={`bg-white rounded-lg p-3 md:p-4 border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                        dm.unread
                          ? "border-secondary-400 bg-secondary-50"
                          : "border-primary-200 hover:border-primary-400"
                      }`}
                      onClick={() => setSelectedDmId(dm.id)}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="relative">
                          <Image
                            src={professors[dm.from]?.img}
                            alt={dm.from}
                            width={40}
                            height={40}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-primary-200"
                          />
                          {dm.unread && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full border border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-secondary-900 text-xs md:text-sm">
                              {dm.from}
                            </span>
                            <span
                              suppressHydrationWarning
                              className="text-xs text-secondary-500"
                            >
                              {new Date(dm.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-secondary-600 text-xs md:text-sm truncate">
                            {dm.message}
                          </p>
                        </div>
                        <FaChevronRight className="text-secondary-400 text-xs flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* DM Chat Screen */}
            {selected === "dms" &&
              selectedDmId !== null &&
              (() => {
                const dm = dms.find((x) => x.id === selectedDmId);
                if (!dm) return null;
                const history = dmHistory[selectedDmId] || [];
                const prof = professors[dm.from];
                return (
                  <div className="h-[calc(70vh)] md:h-full flex flex-col bg-white">
                    {/* Chat Header */}
                    <div className="bg-white border-b border-primary-200 px-3 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-4">
                      <button
                        onClick={() => setSelectedDmId(null)}
                        className="text-secondary-600 hover:text-secondary-900 transition-colors"
                        aria-label="Back"
                      >
                        ←
                      </button>
                      <Image
                        src={prof.img}
                        alt={prof.name}
                        width={40}
                        height={40}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-primary-200"
                      />
                      <div>
                        <h3 className="font-medium text-secondary-900 text-xs md:text-base">
                          {prof.name}
                        </h3>
                        <p className="text-xs text-secondary-600">Active now</p>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-primary-50">
                      <div className="max-w-full md:max-w-2xl mx-auto space-y-3 md:space-y-4">
                        {history.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${
                              msg.from === "You"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[90vw] md:max-w-xs rounded-lg px-3 md:px-4 py-2 md:py-3 shadow-sm ${
                                msg.from === "You"
                                  ? "bg-primary-500 text-white"
                                  : "bg-white text-secondary-800 border border-primary-200"
                              }`}
                            >
                              <div className="break-words whitespace-pre-line text-xs md:text-sm leading-relaxed">
                                {msg.message}
                              </div>
                              <div
                                suppressHydrationWarning
                                className={`text-xs mt-2 ${
                                  msg.from === "You"
                                    ? "text-primary-100"
                                    : "text-secondary-500"
                                }`}
                              >
                                {new Date(msg.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                    </div>

                    {/* Message Input */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!dmInput.trim()) return;
                        setDmHistory((prev) => ({
                          ...prev,
                          [selectedDmId]: [
                            ...(prev[selectedDmId] || []),
                            {
                              from: "You",
                              message: dmInput,
                              date: new Date().toISOString().slice(0, 10),
                            },
                          ],
                        }));
                        setDmInput("");
                      }}
                      className="bg-white border-t border-primary-200 p-3 md:p-4"
                    >
                      <div className="max-w-full md:max-w-2xl mx-auto flex items-center gap-2 md:gap-3">
                        <input
                          type="text"
                          value={dmInput}
                          onChange={(e) => setDmInput(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-primary-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs md:text-sm"
                        />
                        <button
                          type="submit"
                          className="bg-primary-500 hover:bg-primary-600 text-white p-2 md:p-3 rounded-full transition-colors flex items-center justify-center"
                          disabled={!dmInput.trim()}
                        >
                          <FaPaperPlane className="text-xs md:text-sm" />
                        </button>
                      </div>
                    </form>
                  </div>
                );
              })()}
          </main>
        </div>
      </div>
    </>
  );
}
