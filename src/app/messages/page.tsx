"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaBullhorn, FaEnvelope, FaChevronRight, FaPaperPlane } from "react-icons/fa";

const announcements = [
  {
    id: 1,
    title: "Exam Schedule Released",
    content: "The final exam schedule is now available. Please check the portal.",
    date: "2024-06-10",
    from: "Prof. Smith",
  },
  {
    id: 2,
    title: "Assignment Deadline Extended",
    content: "The deadline for Assignment 3 has been extended by 2 days.",
    date: "2024-06-08",
    from: "Dr. Lee",
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
    <div style={{
      display: "flex",
      height: "80vh",
      border: "1px solid #e0e0e0",
      borderRadius: 8,
      overflow: "hidden",
      background: "#fff"
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: "#f7f7fa",
        borderRight: "1px solid #e0e0e0",
        display: "flex",
        flexDirection: "column",
        padding: "1rem 0"
      }}>
        {sidebarItems.map(item => (
          <button
            key={item.key}
            onClick={() => setSelected(item.key as any)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0.75rem 1.5rem",
              background: selected === item.key ? "#e3e7ff" : "transparent",
              border: "none",
              outline: "none",
              fontWeight: selected === item.key ? 600 : 400,
              color: "#222",
              fontSize: 16,
              cursor: "pointer",
              width: "100%",
              textAlign: "left"
            }}
          >
            {item.icon}
            {item.label}
            {item.key === "announcements" && (
              <span style={{
                marginLeft: "auto",
                background: "#6c63ff",
                color: "#fff",
                borderRadius: 12,
                fontSize: 12,
                padding: "2px 8px"
              }}>{announcements.length}</span>
            )}
            {item.key === "dms" && (
              <span style={{
                marginLeft: "auto",
                background: "#ff6b6b",
                color: "#fff",
                borderRadius: 12,
                fontSize: 12,
                padding: "2px 8px"
              }}>{dms.filter(dm => dm.unread).length}</span>
            )}
          </button>
        ))}
      </aside>
      {/* Main Content */}
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto", position: "relative" }}>
        {/* Announcements List */}
        {selected === "announcements" && selectedAnnouncementId === null && (
          <section>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FaBullhorn style={{ color: "#6c63ff" }} /> Announcements
            </h2>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 24 }}>
              {announcements.map(a => (
                <li
                  key={a.id}
                  style={{
                    background: "#f1f3fa",
                    borderRadius: 8,
                    marginBottom: 18,
                    padding: "1rem 1.5rem",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer"
                  }}
                  onClick={() => setSelectedAnnouncementId(a.id)}
                >
                  <img
                    src={professors[a.from]?.img}
                    alt={a.from}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      marginRight: 16,
                      objectFit: "cover",
                      border: "2px solid #e0e0e0"
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>
                      {a.title}
                    </div>
                    <div style={{ color: "#444", marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 300 }}>
                      {a.content}
                    </div>
                    <div style={{ fontSize: 13, color: "#888", display: "flex", alignItems: "center", gap: 12 }}>
                      <span>From: {a.from}</span>
                      <span>•</span>
                      <span>{a.date}</span>
                    </div>
                  </div>
                  <FaChevronRight style={{ color: "#bbb", marginLeft: 12 }} />
                </li>
              ))}
            </ul>
          </section>
        )}
        {/* Announcement Focused View */}
        {selected === "announcements" && selectedAnnouncementId !== null && (() => {
          const a = announcements.find(x => x.id === selectedAnnouncementId);
          if (!a) return null;
          return (
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(255,255,255,0.98)",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 32
            }}>
              <div style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                padding: "2rem 2.5rem",
                maxWidth: 480,
                width: "100%",
                textAlign: "center",
                position: "relative"
              }}>
                <button
                  onClick={() => setSelectedAnnouncementId(null)}
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    background: "none",
                    border: "none",
                    fontSize: 22,
                    color: "#888",
                    cursor: "pointer"
                  }}
                  aria-label="Close"
                >×</button>
                <img
                  src={professors[a.from]?.img}
                  alt={a.from}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    marginBottom: 18,
                    objectFit: "cover",
                    border: "2px solid #e0e0e0"
                  }}
                />
                <h2 style={{ fontWeight: 700, marginBottom: 10 }}>{a.title}</h2>
                <div style={{ color: "#444", marginBottom: 18, fontSize: 17 }}>{a.content}</div>
                <div style={{ fontSize: 14, color: "#888" }}>
                  From: {a.from} • {a.date}
                </div>
              </div>
            </div>
          );
        })()}
        {/* DMs List */}
        {selected === "dms" && selectedDmId === null && (
          <section>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FaEnvelope style={{ color: "#ff6b6b" }} /> Direct Messages
            </h2>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 24 }}>
              {dms.map(dm => (
                <li
                  key={dm.id}
                  style={{
                    background: dm.unread ? "#ffeaea" : "#f7f7fa",
                    borderRadius: 8,
                    marginBottom: 16,
                    padding: "1rem 1.5rem",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer"
                  }}
                  onClick={() => setSelectedDmId(dm.id)}
                >
                  <img
                    src={professors[dm.from]?.img}
                    alt={dm.from}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      marginRight: 16,
                      objectFit: "cover",
                      border: "2px solid #e0e0e0"
                    }}
                  />
                  <div style={{
                    flex: 1,
                    fontWeight: dm.unread ? 600 : 400,
                    color: "#222"
                  }}>
                    <div style={{ fontSize: 15 }}>
                      <span style={{ color: "#6c63ff", fontWeight: 500 }}>{dm.from}</span>
                      <span style={{ marginLeft: 12, color: "#888", fontSize: 13 }}>{dm.date}</span>
                    </div>
                    <div style={{ marginTop: 4, color: "#444", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>
                      {dm.message}
                    </div>
                  </div>
                  <FaChevronRight style={{ color: "#bbb", marginLeft: 12 }} />
                  {dm.unread && (
                    <span style={{
                      marginLeft: 10,
                      width: 10,
                      height: 10,
                      background: "#ff6b6b",
                      borderRadius: "50%",
                      display: "inline-block"
                    }} />
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        {/* DM Chat Screen */}
        {selected === "dms" && selectedDmId !== null && (() => {
          const dm = dms.find(x => x.id === selectedDmId);
          if (!dm) return null;
          const history = dmHistory[selectedDmId] || [];
          const prof = professors[dm.from];
          return (
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(255,255,255,0.98)",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              height: "100%"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                padding: "1rem 2rem",
                borderBottom: "1px solid #e0e0e0",
                background: "#f7f7fa"
              }}>
                <button
                  onClick={() => setSelectedDmId(null)}
                  style={{
                    marginRight: 18,
                    background: "none",
                    border: "none",
                    fontSize: 22,
                    color: "#888",
                    cursor: "pointer"
                  }}
                  aria-label="Back"
                >←</button>
                <img
                  src={prof.img}
                  alt={prof.name}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    marginRight: 16,
                    objectFit: "cover",
                    border: "2px solid #e0e0e0"
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>{prof.name}</div>
                  <div style={{ color: "#888", fontSize: 13 }}>{dm.date}</div>
                </div>
              </div>
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "1.5rem 2rem",
                background: "#f9f9fc",
                display: "flex",
                flexDirection: "column"
              }}>
                {history.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: msg.from === "You" ? "flex-end" : "flex-start",
                      background: msg.from === "You" ? "#e3e7ff" : "#fff",
                      color: "#222",
                      borderRadius: 12,
                      padding: "0.7rem 1.2rem",
                      marginBottom: 12,
                      maxWidth: 320,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      position: "relative"
                    }}
                  >
                    {msg.from !== "You" && (
                      <img
                        src={prof.img}
                        alt={prof.name}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          position: "absolute",
                          left: -32,
                          top: 6,
                          objectFit: "cover",
                          border: "1px solid #e0e0e0"
                        }}
                      />
                    )}
                    <div style={{ fontSize: 15 }}>{msg.message}</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 4, textAlign: "right" }}>{msg.date}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "1rem 2rem",
                  borderTop: "1px solid #e0e0e0",
                  background: "#fff"
                }}
              >
                <input
                  type="text"
                  value={dmInput}
                  onChange={e => setDmInput(e.target.value)}
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    padding: "0.7rem 1rem",
                    borderRadius: 8,
                    border: "1px solid #e0e0e0",
                    fontSize: 15,
                    marginRight: 12
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: "#6c63ff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "0.7rem 1.2rem",
                    fontSize: 16,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <FaPaperPlane />
                  Send
                </button>
              </form>
            </div>
          );
        })()}
      </main>
    </div>
  );
}
