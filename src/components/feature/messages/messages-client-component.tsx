"use client";

import SetHeaderClientComponent from "@/components/feature/header/set-header-client-component";
import { UserData, Course } from "@/lib/schemas/database";
import { AuthenticatedSession } from "@/lib/types/auth";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
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
import { AlertDialog } from "@/components/core/alert-dialog";
import { TextArea } from "@/components/core/inputs/text-area";
import { TextBox } from "@/components/core/inputs/text-box";
import { Dropdown } from "@/components/core/inputs/dropdown";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
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
    icon: <Megaphone className="w-4 h-4" />,
  },
  {
    key: "dms",
    label: "Direct Messages",
    icon: <Mail className="w-4 h-4" />,
  },
];

export default function MessagesClientComponent({
  userData,
  courses
}: {
  session: AuthenticatedSession;
  userData: UserData;
  courses: Course[];
}) {
  const [selected, setSelected] = useState<"announcements" | "dms">("announcements");
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
  const [selectedDmId, setSelectedDmId] = useState<number | null>(null);
  const [dmHistory, setDmHistory] = useState(dmHistoryInit);
  const [dmInput, setDmInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState<AnnouncementWithReadStatus[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);

  // Modal state
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementWithReadStatus | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    course: "",
    title: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    announcementId: "",
    title: "",
  });

  const isTeacher = userData?.role === "teacher";

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Scroll to bottom of chat on new message
  useEffect(() => {
    if (chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [selectedDmId, dmHistory]);

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

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.course || !announcementForm.title || !announcementForm.content) return;

    setIsSubmitting(true);
    try {
      const url = editingAnnouncement ? "/api/announcement/update" : "/api/announcement/create";
      const body = editingAnnouncement
        ? {
            _id: editingAnnouncement._id,
            courseId: announcementForm.course,
            title: announcementForm.title,
            content: announcementForm.content,
          }
        : {
            courseId: announcementForm.course,
            title: announcementForm.title,
            content: announcementForm.content,
          };

      const response = await fetch(url, {
        method: editingAnnouncement ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        await fetchAnnouncements(); // Refresh announcements list
        setShowAnnouncementModal(false);
        setEditingAnnouncement(null);
        setAnnouncementForm({ course: "", title: "", content: "" });
      } else {
        console.error("Failed to save announcement:", data.error);
        alert("Failed to save announcement: " + data.error);
      }
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("Error saving announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsRead = async (announcementId: string) => {
    if (isTeacher) return; // Teachers don't need to mark as read

    try {
      const response = await fetch("/api/announcement/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ announcementId }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setAnnouncements(prev =>
          prev.map(ann =>
            ann._id === announcementId
              ? { ...ann, isRead: true, readAt: new Date().toISOString() }
              : ann
          )
        );
      }
    } catch (error) {
      console.error("Error marking announcement as read:", error);
    }
  };

  const handleEditAnnouncement = (announcement: AnnouncementWithReadStatus) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      course: announcement.courseId,
      title: announcement.title,
      content: announcement.content,
    });
    setShowAnnouncementModal(true);
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      const response = await fetch(`/api/announcement/${announcementId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        await fetchAnnouncements(); // Refresh announcements list
        setDeleteDialog({ isOpen: false, announcementId: "", title: "" });
      } else {
        console.error("Failed to delete announcement:", data.error);
        alert("Failed to delete announcement: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert("Error deleting announcement");
    }
  };

  const openDeleteDialog = (announcement: AnnouncementWithReadStatus) => {
    setDeleteDialog({
      isOpen: true,
      announcementId: announcement._id,
      title: announcement.title,
    });
  };

  const handleAnnouncementClick = (announcement: AnnouncementWithReadStatus) => {
    const newSelectedId = selectedAnnouncementId === announcement._id ? null : announcement._id;
    setSelectedAnnouncementId(newSelectedId);

    // Mark as read when expanded (for students only)
    if (newSelectedId && !isTeacher && !announcement.isRead) {
      handleMarkAsRead(announcement._id);
    }
  };

  const openNewAnnouncementModal = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({ course: "", title: "", content: "" });
    setShowAnnouncementModal(true);
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
                  setSelectedDmId(null);
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
                      : "text-secondary-400"
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.key === "announcements" && !isTeacher &&
                  announcements.filter((ann) => !ann.isRead).length > 0 && (
                  <span className="bg-secondary-300 text-secondary-50 text-xs px-2 py-0.5 rounded-full font-medium mt-1">
                    {announcements.filter((ann) => !ann.isRead).length}
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
                    className={`${
                      selected === item.key
                        ? "text-secondary-600"
                        : "text-secondary-400"
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
                <div className="mb-4 md:mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-primary-800 mb-2">
                      Announcements
                    </h2>
                    <p className="text-primary-600 text-sm">
                      Stay updated with the latest announcements from your instructors
                    </p>
                  </div>
                  {isTeacher && (
                    <PrimaryButton
                      onClick={openNewAnnouncementModal}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      New Announcement
                    </PrimaryButton>
                  )}
                </div>

                {/* Announcement Modal */}
                <Dialog open={showAnnouncementModal} onOpenChange={setShowAnnouncementModal}>
                  <DialogContent className="max-w-md border-2 border-primary-400 bg-primary-100">
                    <DialogHeader className="rounded-t-lg">
                      <DialogTitle className="text-primary-700">
                        {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
                      </DialogTitle>
                      <DialogDescription className="text-primary-600">
                        {editingAnnouncement
                          ? "Update the announcement details below."
                          : "Create a new announcement for your course."
                        }
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                      <div className="space-y-2">
                        <Dropdown
                          options={courses
                            .filter((c, index, arr) => arr.findIndex(course => course._id.toString() === c._id.toString()) === index)
                            .map(c => ({
                              value: c._id.toString(),
                              label: `${c.courseCode} - ${c.name}`
                            }))}
                          value={announcementForm.course}
                          onChange={(value: string) => setAnnouncementForm(f => ({ ...f, course: value }))}
                          placeholder="Select a course"
                        >
                          Course
                        </Dropdown>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-primary-800">Title</label>
                        <TextBox
                          value={announcementForm.title}
                          onChange={(value) => setAnnouncementForm(f => ({ ...f, title: value }))}
                          placeholder="Enter announcement title"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-primary-800">Content</label>
                        <TextArea
                          value={announcementForm.content}
                          onChange={(value) => setAnnouncementForm(f => ({ ...f, content: value }))}
                          placeholder="Enter announcement content"
                          rows={4}
                        />
                      </div>

                      <DialogFooter className="mt-6">
                        <div className="flex gap-2 w-full justify-end">
                          <SecondaryButton
                            type="button"
                            variant="outline"
                            onClick={() => setShowAnnouncementModal(false)}
                          >
                            Cancel
                          </SecondaryButton>
                          <PrimaryButton
                            type="submit"
                            disabled={isSubmitting || !announcementForm.course || !announcementForm.title || !announcementForm.content}
                          >
                            {isSubmitting ? "Saving..." : editingAnnouncement ? "Update" : "Create"}
                          </PrimaryButton>
                        </div>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                {isLoadingAnnouncements ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="flex items-center gap-3 text-primary-700">
                      <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-medium">Loading announcements...</span>
                    </div>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-center">
                      <Megaphone className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                      <div className="text-primary-700 font-medium">No announcements yet</div>
                      <p className="text-primary-600 text-sm mt-1">Check back later for updates from your instructors</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((a) => (
                      <Card
                        key={a._id}
                        className={cn(
                          "transition-all duration-200 cursor-pointer hover:shadow-md border-2",
                          !isTeacher && !a.isRead
                            ? 'border-primary-400 bg-primary-100'
                            : 'border-primary-200 bg-primary-50 hover:border-primary-300'
                        )}
                        onClick={() => handleAnnouncementClick(a)}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0 border border-primary-300">
                              <Megaphone className="w-4 h-4 text-primary-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-primary-900 text-sm flex items-center gap-2">
                                    {a.title}
                                    {!isTeacher && !a.isRead && (
                                      <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                                    )}
                                  </h3>
                                  <p className="text-primary-700 text-xs mt-1 font-medium">
                                    {a.courseCode} - {a.courseName}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {isTeacher && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditAnnouncement(a);
                                        }}
                                        className="h-8 w-8 p-0 rounded-md hover:bg-primary-200 text-primary-600 hover:text-primary-800 transition-colors flex items-center justify-center border border-primary-300"
                                        title="Edit"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openDeleteDialog(a);
                                        }}
                                        className="h-8 w-8 p-0 rounded-md hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors flex items-center justify-center border border-red-300"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                  {selectedAnnouncementId === a._id ? (
                                    <ChevronDown className="w-4 h-4 text-primary-600 transition-transform" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-primary-600 transition-transform" />
                                  )}
                                </div>
                              </div>
                              <p className="text-primary-800 text-sm mb-3 line-clamp-2">
                                {a.content}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-primary-600">
                                <span suppressHydrationWarning>
                                  {new Date(a.createdAt).toLocaleDateString()}
                                </span>
                                {a.updatedAt !== a.createdAt && (
                                  <>
                                    <span>•</span>
                                    <span suppressHydrationWarning>
                                      Updated {new Date(a.updatedAt).toLocaleDateString()}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        {/* Expanded Content */}
                        {selectedAnnouncementId === a._id && (
                          <CardContent className="pt-0">
                            <div className="bg-primary-200 rounded-lg p-4 border-2 border-primary-400">
                              <div className="mb-4">
                                <h3 className="text-lg font-semibold text-primary-900 mb-2">
                                  {a.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-primary-700 mb-4">
                                  <span className="font-medium">{a.courseCode} - {a.courseName}</span>
                                  <span>•</span>
                                  <span suppressHydrationWarning>
                                    {new Date(a.createdAt).toLocaleDateString()}
                                  </span>
                                  {a.updatedAt !== a.createdAt && (
                                    <>
                                      <span>•</span>
                                      <span suppressHydrationWarning>
                                        Updated {new Date(a.updatedAt).toLocaleDateString()}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="prose prose-sm max-w-none">
                                <div className="text-primary-900 leading-relaxed whitespace-pre-wrap">
                                  {a.content}
                                </div>
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
            {selected === "dms" && selectedDmId === null && (
              <section className="h-full overflow-y-auto">
                <div className="mb-4 md:mb-6">
                  <h2 className="text-xl font-semibold text-primary-800 mb-2">
                    Direct Messages
                  </h2>
                  <p className="text-primary-600 text-sm">
                    Private conversations with your instructors
                  </p>
                </div>
                <div className="space-y-3">
                  {dms.map((dm) => (
                    <Card
                      key={dm.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                        dm.unread
                          ? "border-primary-400 bg-primary-100"
                          : "border-primary-200 bg-primary-50 hover:border-primary-300"
                      )}
                      onClick={() => setSelectedDmId(dm.id)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Image
                              src={professors[dm.from]?.img}
                              alt={dm.from}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover border-2 border-primary-300"
                            />
                            {dm.unread && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-primary-900 text-sm">
                                {dm.from}
                              </span>
                              <span
                                suppressHydrationWarning
                                className="text-xs text-primary-600"
                              >
                                {new Date(dm.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-primary-800 text-sm truncate">
                              {dm.message}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-primary-600 flex-shrink-0" />
                        </div>
                      </CardHeader>
                    </Card>
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
                        <TextBox
                          value={dmInput}
                          onChange={(value) => setDmInput(value)}
                          placeholder="Type your message..."
                          className="flex-1"
                        />
                        <PrimaryButton
                          type="submit"
                          disabled={!dmInput.trim()}
                          className="rounded-full h-9 w-9 p-0"
                        >
                          <Send className="w-4 h-4" />
                        </PrimaryButton>
                      </div>
                    </form>
                  </div>
                );
              })()}
          </main>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, announcementId: "", title: "" })}
        onConfirm={() => handleDeleteAnnouncement(deleteDialog.announcementId)}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${deleteDialog.title}"? This action cannot be undone.`}
        type="confirm"
        confirmText="Delete"
        cancelText="Cancel"
        showCancel={true}
      />
    </>
  );
}
