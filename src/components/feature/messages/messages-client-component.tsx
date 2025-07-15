"use client";

import SetHeaderClientComponent from "@/components/feature/header/set-header-client-component";
import NotificationListener from "@/components/feature/header/notification-listener";
import { UserData, Course } from "@/lib/schemas/database";
import { AuthenticatedSession } from "@/lib/types/auth";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Megaphone,
  Mail,
  ChevronRight,
  Send,
  ChevronDown,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TextBox } from "@/components/core/inputs/text-box";
import { TextArea } from "@/components/core/inputs/text-area";
import { Dropdown } from "@/components/core/inputs/dropdown";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { MultiSelect } from "@/components/core/multi-select";
import { cn } from "@/lib/utils";

// Types for announcements
interface AnnouncementWithReadStatus {
  _id: string;
  title: string;
  content: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isRead?: boolean;
  readAt?: string;
}

// Types for messages
interface MessageWithReadStatus {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  readAt?: string;
  senderName?: string;
  receiverName?: string;
}

interface ConversationSummary {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
}

const sidebarItems = [
  {
    key: "announcements",
    label: "Announcements",
    icon: <Megaphone className="w-4 h-4" />,
  },
  {
    key: "dms",
    label: "Direct Messages",
    icon: <Mail className="w-4 h-4" />,
  },
];

export default function MessagesClientComponent({
  session,
  userData,
  courses
}: {
  session: AuthenticatedSession;
  userData: UserData;
  courses: Course[];
}) {
  const [selected, setSelected] = useState<"announcements" | "dms">("announcements");
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
  const [selectedConversationUserId, setSelectedConversationUserId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState<AnnouncementWithReadStatus[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);

  // Messages state
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentMessages, setCurrentMessages] = useState<MessageWithReadStatus[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Contacts modal state
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Announcement modal state
  const [showCreateAnnouncementModal, setShowCreateAnnouncementModal] = useState(false);
  const [showEditAnnouncementModal, setShowEditAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementWithReadStatus | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [isUpdatingAnnouncement, setIsUpdatingAnnouncement] = useState(false);

  const isTeacher = userData?.role === "teacher";

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const response = await fetch("/api/messages/conversations");
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations);
      } else {
        console.error("Failed to fetch conversations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  const markConversationAsRead = useCallback(async (otherUserId: string) => {
    try {
      await fetch("/api/messages/mark-conversation-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otherUserId }),
      });
      // Refresh conversations to update unread count
      fetchConversations();
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  }, [fetchConversations]);

  // Real-time message stream listener
  useEffect(() => {
    if (selected === "dms" && session.user.id) {
      const eventSource = new EventSource("/api/messages/stream");

      eventSource.onmessage = (event) => {
        const newMessage: MessageWithReadStatus = JSON.parse(event.data);

        // Update conversations list for unread count and last message
        fetchConversations();

        // If the message is for the currently open conversation, add it to the view
        if (newMessage.senderId === selectedConversationUserId) {
          setCurrentMessages((prevMessages) => [...prevMessages, newMessage]);
          // Also mark it as read immediately
          markConversationAsRead(selectedConversationUserId);
        }
      };

      eventSource.onerror = (err) => {
        console.error("EventSource failed:", err);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [selected, selectedConversationUserId, session.user.id, fetchConversations, markConversationAsRead]);

  const fetchConversationMessages = useCallback(async (otherUserId: string) => {
    try {
      setIsLoadingMessages(true);
      const response = await fetch(`/api/messages/conversation?otherUserId=${otherUserId}`);
      const data = await response.json();

      if (data.success) {
        setCurrentMessages(data.messages);
      } else {
        console.error("Failed to fetch messages:", data.error);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchAnnouncements();
    fetchConversations();
  }, [fetchConversations]);

  // Scroll to bottom of chat on new message
  useEffect(() => {
    if (chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversationUserId, currentMessages]);

  // Fetch conversation messages when a conversation is selected
  useEffect(() => {
    if (selectedConversationUserId) {
      fetchConversationMessages(selectedConversationUserId);
      markConversationAsRead(selectedConversationUserId);
    }
  }, [selectedConversationUserId, fetchConversationMessages, markConversationAsRead]);

  const fetchAnnouncements = async () => {
    try {
      setIsLoadingAnnouncements(true);
      const response = await fetch("/api/announcement/list");
      const data = await response.json();

      if (data.success) {
        setAnnouncements(data.announcements);
      } else {
        console.error("Failed to fetch announcements:", data.error);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setIsLoadingAnnouncements(false);
    }
  };

  const fetchAvailableContacts = async () => {
    try {
      setIsLoadingContacts(true);
      const response = await fetch("/api/messages/contacts");
      const data = await response.json();

      if (data.success) {
        setAvailableContacts(data.contacts);
      } else {
        console.error("Failed to fetch contacts:", data.error);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversationUserId || !messageInput.trim()) return;

    try {
      setIsSendingMessage(true);
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: selectedConversationUserId,
          message: messageInput.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessageInput("");
        // Refresh messages
        fetchConversationMessages(selectedConversationUserId);
        // Refresh conversations to update last message
        fetchConversations();
      } else {
        console.error("Failed to send message:", data.error);
        alert("Failed to send message: " + data.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const startNewConversation = async () => {
    if (selectedContactIds.length === 0) return;

    // For now, we'll only support starting conversation with one contact
    const contactId = selectedContactIds[0];

    setSelectedConversationUserId(contactId);
    setSelected("dms");
    setShowNewMessageModal(false);
    setSelectedContactIds([]);
  };

  // Announcement functions
  const openCreateAnnouncementModal = () => {
    setAnnouncementTitle("");
    setAnnouncementContent("");
    setSelectedCourseId("");
    setShowCreateAnnouncementModal(true);
  };

  const openEditAnnouncementModal = (announcement: AnnouncementWithReadStatus) => {
    setEditingAnnouncement(announcement);
    setAnnouncementTitle(announcement.title);
    setAnnouncementContent(announcement.content);
    setSelectedCourseId(announcement.courseId);
    setShowEditAnnouncementModal(true);
  };

  const closeAnnouncementModals = () => {
    setShowCreateAnnouncementModal(false);
    setShowEditAnnouncementModal(false);
    setEditingAnnouncement(null);
    setAnnouncementTitle("");
    setAnnouncementContent("");
    setSelectedCourseId("");
  };

  const createAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementContent.trim() || !selectedCourseId) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setIsCreatingAnnouncement(true);
      const response = await fetch("/api/announcement/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: announcementTitle.trim(),
          content: announcementContent.trim(),
          courseId: selectedCourseId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        closeAnnouncementModals();
        fetchAnnouncements();
      } else {
        console.error("Failed to create announcement:", data.error);
        alert("Failed to create announcement: " + data.error);
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      alert("Error creating announcement");
    } finally {
      setIsCreatingAnnouncement(false);
    }
  };

  const updateAnnouncement = async () => {
    if (!editingAnnouncement || !announcementTitle.trim() || !announcementContent.trim() || !selectedCourseId) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setIsUpdatingAnnouncement(true);
      const response = await fetch(`/api/announcement/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: editingAnnouncement._id,
          title: announcementTitle.trim(),
          content: announcementContent.trim(),
          courseId: selectedCourseId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        closeAnnouncementModals();
        fetchAnnouncements();
      } else {
        console.error("Failed to update announcement:", data.error);
        alert("Failed to update announcement: " + data.error);
      }
    } catch (error) {
      console.error("Error updating announcement:", error);
      alert("Error updating announcement");
    } finally {
      setIsUpdatingAnnouncement(false);
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    try {
      const response = await fetch(`/api/announcement/${announcementId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchAnnouncements();
        // Close expanded view if this announcement was selected
        if (selectedAnnouncementId === announcementId) {
          setSelectedAnnouncementId(null);
        }
      } else {
        console.error("Failed to delete announcement:", data.error);
        alert("Failed to delete announcement: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert("Error deleting announcement");
    }
  };

  const markAnnouncementAsRead = async (announcementId: string) => {
    try {
      const response = await fetch("/api/announcement/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          announcementId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the local state to mark as read
        setAnnouncements((prevAnnouncements) =>
          prevAnnouncements.map((ann) =>
            ann._id === announcementId
              ? { ...ann, isRead: true, readAt: new Date().toISOString() }
              : ann
          )
        );
      } else {
        console.error("Failed to mark announcement as read:", data.error);
      }
    } catch (error) {
      console.error("Error marking announcement as read:", error);
    }
  };

  const openNewMessageModal = async () => {
    setShowNewMessageModal(true);
    await fetchAvailableContacts();
  };

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
                  setSelectedConversationUserId(null);
                }}
                className={`flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium transition-all duration-200 ${
                  selected === item.key
                    ? "bg-secondary-100 text-secondary-800 border-b-2 border-secondary-500"
                    : "text-secondary-700 hover:bg-secondary-100"
                }`}
              >
                <span
                  className={`mb-1 ${
                    selected === item.key
                      ? "text-secondary-600"
                      : "text-secondary-500"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="relative">
                  {item.label}
                  {item.key === "announcements" && !isTeacher &&
                    announcements.filter((ann) => !ann.isRead).length > 0 && (
                    <span className="bg-secondary-300 text-secondary-50 text-xs px-2 py-0.5 rounded-full font-medium mt-1">
                      {announcements.filter((ann) => !ann.isRead).length}
                    </span>
                  )}
                  {item.key === "dms" &&
                    conversations.reduce((total, conv) => total + conv.unreadCount, 0) > 0 && (
                    <span className="bg-secondary-300 text-secondary-50 text-xs px-2 py-0.5 rounded-full font-medium mt-1">
                      {conversations.reduce((total, conv) => total + conv.unreadCount, 0)}
                    </span>
                  )}
                </span>
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
                    setSelectedConversationUserId(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-left transition-all duration-200 ${
                    selected === item.key
                      ? "cursor-pointer bg-secondary-100 text-secondary-800 font-medium border border-secondary-400"
                      : "cursor-pointer text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900 border border-transparent"
                  }`}
                >
                  <span
                    className={`${
                      selected === item.key
                        ? "text-secondary-600"
                        : "text-secondary-500"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {item.key === "announcements" && !isTeacher &&
                    announcements.filter((ann) => !ann.isRead).length > 0 && (
                    <span className="bg-secondary-300 text-secondary-50 text-xs px-2 py-1 rounded-full font-medium">
                      {announcements.filter((ann) => !ann.isRead).length}
                    </span>
                  )}
                  {item.key === "dms" &&
                    conversations.reduce((total, conv) => total + conv.unreadCount, 0) > 0 && (
                      <span className="bg-secondary-300 text-secondary-50 text-xs px-2 py-1 rounded-full font-medium">
                        {conversations.reduce((total, conv) => total + conv.unreadCount, 0)}
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
                <div className="mb-4 md:mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-primary-800 mb-2">
                      Announcements
                    </h2>
                    <p className="text-primary-600 text-sm">
                      Important updates from your courses
                    </p>
                  </div>
                  {isTeacher && (
                    <PrimaryButton onClick={openCreateAnnouncementModal}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Announcement
                    </PrimaryButton>
                  )}
                </div>

                {isLoadingAnnouncements ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="text-primary-600">Loading announcements...</div>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <Megaphone className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-primary-800 mb-2">
                      No announcements yet
                    </h3>
                    <p className="text-primary-600">
                      {isTeacher
                        ? "Create your first announcement to communicate with students"
                        : "Your instructors haven't posted any announcements yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <Card
                        key={announcement._id}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                          selectedAnnouncementId === announcement._id
                            ? "border-primary-400 bg-primary-100"
                            : !announcement.isRead && !isTeacher
                            ? "border-primary-300 bg-primary-50"
                            : "border-primary-200 bg-white hover:border-primary-300"
                        )}
                        onClick={() => {
                          const newSelectedId = selectedAnnouncementId === announcement._id ? null : announcement._id;
                          setSelectedAnnouncementId(newSelectedId);

                          // Mark as read when expanded (for students only)
                          if (newSelectedId && !isTeacher && !announcement.isRead) {
                            markAnnouncementAsRead(announcement._id);
                          }
                        }}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded">
                                  {announcement.courseCode}
                                </span>
                                {!announcement.isRead && !isTeacher && (
                                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                )}
                              </div>
                              <h3 className="font-semibold text-primary-900 text-sm mb-1">
                                {announcement.title}
                              </h3>
                              <p className="text-xs text-primary-600">
                                {announcement.courseName} • {new Date(announcement.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {isTeacher && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditAnnouncementModal(announcement);
                                    }}
                                    className="text-secondary-600 hover:text-secondary-800 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteAnnouncement(announcement._id);
                                    }}
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <ChevronDown
                                className={`w-4 h-4 text-primary-600 transition-transform ${
                                  selectedAnnouncementId === announcement._id ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </div>
                        </CardHeader>
                        {selectedAnnouncementId === announcement._id && (
                          <CardContent className="pt-0">
                            <div className="border-t border-primary-200 pt-4">
                              <div className="prose prose-sm max-w-none text-primary-800">
                                {announcement.content}
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* DMs List */}
            {selected === "dms" && selectedConversationUserId === null && (
              <section className="h-full overflow-y-auto">
                <div className="mb-4 md:mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-primary-800 mb-2">
                      Direct Messages
                    </h2>
                    <p className="text-primary-600 text-sm">
                      Private conversations with your instructors and classmates
                    </p>
                  </div>
                  <PrimaryButton onClick={openNewMessageModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Message
                  </PrimaryButton>
                </div>

                {isLoadingConversations ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="text-primary-600">Loading conversations...</div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-primary-800 mb-2">
                      No conversations yet
                    </h3>
                    <p className="text-primary-600 mb-4">
                      Start a conversation by clicking &quot;New Message&quot;
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversations.map((conversation) => (
                      <Card
                        key={conversation.conversationId}
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                          conversation.unreadCount > 0
                            ? "border-primary-400 bg-primary-100"
                            : "border-primary-200 bg-primary-50 hover:border-primary-300"
                        )}
                        onClick={() => setSelectedConversationUserId(conversation.otherUserId)}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-primary-300 flex items-center justify-center text-primary-800 font-semibold">
                                {conversation.otherUserName.charAt(0).toUpperCase()}
                              </div>
                              {conversation.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                                  {conversation.unreadCount}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-primary-900 text-sm">
                                  {conversation.otherUserName}
                                  <span className="text-xs text-primary-600 ml-2">
                                    ({conversation.otherUserRole})
                                  </span>
                                </span>
                                <span
                                  suppressHydrationWarning
                                  className="text-xs text-primary-600"
                                >
                                  {new Date(conversation.lastMessageTime).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-primary-800 text-sm truncate">
                                {conversation.lastMessage}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-primary-600 flex-shrink-0" />
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* DM Chat Screen */}
            {selected === "dms" && selectedConversationUserId !== null && (
              <div className="h-[calc(70vh)] flex flex-col bg-white">
                {/* Chat Header */}
                <div className="bg-white border-b border-primary-200 px-3 md:px-6 py-3 md:py-4 flex items-center gap-2 md:gap-4">
                  <button
                    onClick={() => setSelectedConversationUserId(null)}
                    className="text-secondary-600 hover:text-secondary-900 transition-colors"
                    aria-label="Back"
                  >
                    ←
                  </button>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary-300 flex items-center justify-center text-primary-800 font-semibold">
                    {conversations.find(c => c.otherUserId === selectedConversationUserId)?.otherUserName.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="font-medium text-secondary-900 text-xs md:text-base">
                      {conversations.find(c => c.otherUserId === selectedConversationUserId)?.otherUserName || 'Unknown User'}
                    </h3>
                    <p className="text-xs text-secondary-600">
                      {conversations.find(c => c.otherUserId === selectedConversationUserId)?.otherUserRole || 'Unknown Role'}
                    </p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-primary-50">
                  {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="text-primary-600">Loading messages...</div>
                    </div>
                  ) : (
                    <div className="max-w-full md:max-w-2xl mx-auto space-y-3 md:space-y-4">
                      {currentMessages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${
                            msg.senderId === session.user.id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[90vw] md:max-w-xs rounded-lg px-3 md:px-4 py-2 md:py-3 shadow-sm ${
                              msg.senderId === session.user.id
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
                                msg.senderId === session.user.id
                                  ? "text-primary-100"
                                  : "text-secondary-500"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="bg-white border-t border-primary-200 p-3 md:p-4"
                >
                  <div className="max-w-full md:max-w-2xl mx-auto flex items-center gap-2 md:gap-3">
                    <TextBox
                      value={messageInput}
                      onChange={(value) => setMessageInput(value)}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <PrimaryButton
                      type="submit"
                      disabled={!messageInput.trim() || isSendingMessage}
                      className="rounded-full h-9 w-9 p-0"
                    >
                      <Send className="w-4 h-4" />
                    </PrimaryButton>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* New Message Modal */}
      <Dialog open={showNewMessageModal} onOpenChange={setShowNewMessageModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
            <DialogDescription>
              Select who you&apos;d like to send a message to.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isLoadingContacts ? (
              <div className="text-center py-4">Loading contacts...</div>
            ) : (
              <MultiSelect
                options={availableContacts.map(contact => ({
                  value: contact.id,
                  label: `${contact.name} (${contact.role})`,
                }))}
                selected={selectedContactIds}
                onChange={setSelectedContactIds}
                placeholder="Select a contact..."
                emptyText="No contacts available"
              />
            )}
          </div>

          <DialogFooter>
            <SecondaryButton onClick={() => setShowNewMessageModal(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={startNewConversation}
              disabled={selectedContactIds.length === 0}
            >
              Start Conversation
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Announcement Modal */}
      <Dialog open={showCreateAnnouncementModal} onOpenChange={setShowCreateAnnouncementModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary-800 text-xl font-semibold">
              Create New Announcement
            </DialogTitle>
            <DialogDescription className="text-primary-600">
              Share important information with your students.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-800">Course</label>
              <Dropdown
                options={courses.map(course => ({
                  value: course._id.toString(),
                  label: `${course.courseCode} - ${course.name}`,
                }))}
                value={selectedCourseId}
                onChange={setSelectedCourseId}
                placeholder="Select a course..."
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-800">Title</label>
              <TextBox
                value={announcementTitle}
                onChange={setAnnouncementTitle}
                placeholder="Enter announcement title..."
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-800">Content</label>
              <TextArea
                value={announcementContent}
                onChange={setAnnouncementContent}
                placeholder="Enter announcement content..."
                rows={6}
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <SecondaryButton onClick={closeAnnouncementModals}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={createAnnouncement}
              disabled={isCreatingAnnouncement || !announcementTitle.trim() || !announcementContent.trim() || !selectedCourseId}
            >
              {isCreatingAnnouncement ? "Creating..." : "Create Announcement"}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Announcement Modal */}
      <Dialog open={showEditAnnouncementModal} onOpenChange={setShowEditAnnouncementModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary-800 text-xl font-semibold">
              Edit Announcement
            </DialogTitle>
            <DialogDescription className="text-primary-600">
              Update your announcement details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-800">Course</label>
              <Dropdown
                options={courses.map(course => ({
                  value: course._id.toString(),
                  label: `${course.courseCode} - ${course.name}`,
                }))}
                value={selectedCourseId}
                onChange={setSelectedCourseId}
                placeholder="Select a course..."
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-800">Title</label>
              <TextBox
                value={announcementTitle}
                onChange={setAnnouncementTitle}
                placeholder="Enter announcement title..."
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-800">Content</label>
              <TextArea
                value={announcementContent}
                onChange={setAnnouncementContent}
                placeholder="Enter announcement content..."
                rows={6}
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <SecondaryButton onClick={closeAnnouncementModals}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={updateAnnouncement}
              disabled={isUpdatingAnnouncement || !announcementTitle.trim() || !announcementContent.trim() || !selectedCourseId}
            >
              {isUpdatingAnnouncement ? "Updating..." : "Update Announcement"}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Real-time notification listener */}
      <NotificationListener
        onNotify={(data: object) => {
          // Type assertion for notification data
          const messageData = data as { senderId?: string; receiverId?: string; message?: string };
          // Only refresh conversations for announcements or other non-message notifications
          // Message updates are now handled by the dedicated EventSource stream above
          if (!messageData.senderId && !messageData.receiverId) {
            // This is likely an announcement or other notification
            if (selected === "announcements") {
              fetchAnnouncements();
            }
          }
        }}
      />
    </>
  );
}
