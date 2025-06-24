"use client";

import SetHeaderClientComponent from "@/components/feature/header/set-header-client-component";
import React, { useState, useRef, useEffect } from "react";
import { FaBullhorn, FaEnvelope, FaChevronRight, FaPaperPlane, FaChevronDown } from "react-icons/fa";

const announcements = [
  {
    id: 1,
    title: "Exam Schedule Released",
    content: "The final exam schedule is now available. Please check the portal.",
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
const dmHistoryInit: Record<number, { from: string; message: string; date: string }[]> = {
  1: [
    { from: "Prof. Smith", message: "Please see me after class tomorrow.", date: "2024-06-09" },
    { from: "You", message: "Sure, Prof. Smith!", date: "2024-06-09" },
  ],
  2: [
    { from: "Dr. Lee", message: "Your project proposal looks good.", date: "2024-06-07" },
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

export default function MessagesPage() {
  const [selected, setSelected] = useState<"announcements" | "dms">("announcements");
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<number | null>(null);
  const [selectedDmId, setSelectedDmId] = useState<number | null>(null);
  const [dmHistory, setDmHistory] = useState(dmHistoryInit);
  const [dmInput, setDmInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat on new message
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [selectedDmId, dmHistory]);

  return (
    <>
    <SetHeaderClientComponent title={"MESSAGES"} />
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[80vh] flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          </div>
          <nav className="flex-1 p-4">
            {sidebarItems.map(item => (
              <button
                key={item.key}
                onClick={() => {
                  setSelected(item.key as "announcements" | "dms");
                  setSelectedAnnouncementId(null);
                  setSelectedDmId(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-left transition-all duration-200 ${
                  selected === item.key
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className={`text-lg ${selected === item.key ? "text-blue-600" : "text-gray-500"}`}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.key === "announcements" && announcements.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                    {announcements.length}
                  </span>
                )}
                {item.key === "dms" && dms.filter(dm => dm.unread).length > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                    {dms.filter(dm => dm.unread).length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 relative">
          {/* Announcements List */}
          {selected === "announcements" && (
            <section className="p-6 h-full overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Announcements
                </h2>
                <p className="text-gray-600 text-sm">Stay updated with the latest announcements from your instructors</p>
              </div>
              <div className="space-y-3">
                {announcements.map(a => (
                  <div
                    key={a.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200"
                  >
                    {/* Announcement Header */}
                    <div
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedAnnouncementId === a.id ? 'bg-blue-50 border-b border-gray-200' : ''
                      }`}
                      onClick={() => setSelectedAnnouncementId(selectedAnnouncementId === a.id ? null : a.id)}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={professors[a.from]?.img}
                          alt={a.from}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-medium text-gray-900 text-sm">{a.title}</h3>
                            {selectedAnnouncementId === a.id ? (
                              <FaChevronDown className="text-gray-400 text-xs mt-1 flex-shrink-0 transition-transform" />
                            ) : (
                              <FaChevronRight className="text-gray-400 text-xs mt-1 flex-shrink-0 transition-transform" />
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{a.content}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{a.from}</span>
                            <span>•</span>
                            <span>{a.course}</span>
                            <span>•</span>
                            <span>{new Date(a.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Announcement Expanded Content */}
                    {selectedAnnouncementId === a.id && (
                      <div className="px-4 pb-4 bg-blue-50">
                        <div className="bg-white rounded-lg p-6 border border-blue-100">
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{a.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                              <span className="font-medium">{a.from}</span>
                              <span>•</span>
                              <span>{a.course}</span>
                              <span>•</span>
                              <span>{new Date(a.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <div className="text-gray-700 leading-relaxed">{a.content}</div>
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
            <section className="p-6 h-full overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Direct Messages
                </h2>
                <p className="text-gray-600 text-sm">Private conversations with your instructors</p>
              </div>
              <div className="space-y-3">
                {dms.map(dm => (
                  <div
                    key={dm.id}
                    className={`bg-white rounded-lg p-4 border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                      dm.unread
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 hover:border-blue-200"
                    }`}
                    onClick={() => setSelectedDmId(dm.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={professors[dm.from]?.img}
                          alt={dm.from}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        {dm.unread && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900 text-sm">{dm.from}</span>
                          <span className="text-xs text-gray-500">{new Date(dm.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-600 text-sm truncate">{dm.message}</p>
                      </div>
                      <FaChevronRight className="text-gray-400 text-xs flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* DM Chat Screen */}
          {selected === "dms" && selectedDmId !== null && (() => {
            const dm = dms.find(x => x.id === selectedDmId);
            if (!dm) return null;
            const history = dmHistory[selectedDmId] || [];
            const prof = professors[dm.from];
            return (
              <div className="h-full flex flex-col bg-white">
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
                  <button
                    onClick={() => setSelectedDmId(null)}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    aria-label="Back"
                  >
                    ←
                  </button>
                  <img
                    src={prof.img}
                    alt={prof.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{prof.name}</h3>
                    <p className="text-xs text-gray-600">Active now</p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  <div className="max-w-2xl mx-auto space-y-4">
                    {history.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.from === "You" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-xs rounded-lg px-4 py-3 shadow-sm ${
                          msg.from === "You"
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}>
                          <div className="break-words whitespace-pre-line text-sm leading-relaxed">
                            {msg.message}
                          </div>
                          <div className={`text-xs mt-2 ${
                            msg.from === "You" ? "text-blue-100" : "text-gray-500"
                          }`}>
                            {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!dmInput.trim()) return;
                    setDmHistory(prev => ({
                      ...prev,
                      [selectedDmId]: [
                        ...(prev[selectedDmId] || []),
                        { from: "You", message: dmInput, date: new Date().toISOString().slice(0, 10) }
                      ]
                    }));
                    setDmInput("");
                  }}
                  className="bg-white border-t border-gray-200 p-4"
                >
                  <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <input
                      type="text"
                      value={dmInput}
                      onChange={e => setDmInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors flex items-center justify-center"
                      disabled={!dmInput.trim()}
                    >
                      <FaPaperPlane className="text-sm" />
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
