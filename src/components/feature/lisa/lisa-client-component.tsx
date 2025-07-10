"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SetHeaderClientComponent from "@/components/feature/header/set-header-client-component";
import {
  MessageCircle,
  ChevronUp,
  BookOpen,
  Tag,
  FileText,
  ClipboardList,
  File,
  Megaphone,
} from "lucide-react";
import { MultiSelect } from "@/components/core/multi-select";
import { AuthenticatedSession } from "@/lib/types/auth";
import { Course, UserData } from "@/lib/schemas/database";

interface Message {
  id: string;
  text: string;
  sender: "user" | "lisa";
  timestamp: Date;
  type?: "assignment" | "quiz" | "lecture" | "material" | "general" | "error";
  course?: string;
}

interface ContentType {
  id: string;
  name: string;
  icon: string;
}

// const COURSE_COLORS = {
//   blue: "bg-primary-100 text-primary-700 border-primary-300",
//   green: "bg-secondary-100 text-secondary-700 border-secondary-300",
//   rose: "bg-accent-100 text-accent-700 border-accent-300",
//   purple: "bg-primary-200 text-primary-800 border-primary-400",
//   brown: "bg-secondary-200 text-secondary-800 border-secondary-400",
//   red: "bg-accent-200 text-accent-800 border-accent-400",
// };

const CONTENT_TYPES: ContentType[] = [
  { id: "assignment", name: "Assignment", icon: "assignment" },
  { id: "content", name: "Content", icon: "content" },
  { id: "syllabus", name: "Syllabus", icon: "syllabus" },
  { id: "announcement", name: "Announcement", icon: "announcement" },
];

// Replace iconForType to use lucide icons
const LUCIDE_TYPE_ICONS: Record<string, React.ElementType> = {
  assignment: ClipboardList,
  content: BookOpen,
  syllabus: FileText,
  announcement: Megaphone,
};

function iconForTypeLucide(type: string) {
  return LUCIDE_TYPE_ICONS[type] || File;
}

function MessageList({ messages }: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-primary-50 w-full px-6 py-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((message) => {
          const isError = message.type === "error";
          return (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-3 max-w-[70%] shadow-sm ${
                  message.sender === "user"
                    ? "bg-primary-600 text-white"
                    : isError
                      ? "bg-red-100 text-red-800 border-l-4 border-red-400"
                      : "bg-white text-gray-800 border-l-4 border-primary-300"
                }`}
              >
                <div className="break-words whitespace-pre-line text-sm leading-relaxed">
                  {message.text}
                </div>
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

function ChatInput({
  onSend,
  disabled,
  selectedCourses,
  selectedTypes,
  onCoursesChange,
  onTypesChange,
  courses,
}: {
  onSend: (msg: string) => void;
  disabled: boolean;
  selectedCourses: string[];
  selectedTypes: string[];
  onCoursesChange: (selected: string[]) => void;
  onTypesChange: (selected: string[]) => void;
  courses: Course[];
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  // Auto-resize textarea but maintain minimum size
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "60px"; // Set minimum height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height =
        Math.max(60, Math.min(scrollHeight, 200)) + "px";
    }
  }, [input]);

  const getSearchContextText = () => {
    const coursesText =
      selectedCourses.length === 0 || selectedCourses.length === courses.length
        ? "all courses"
        : `${selectedCourses.length} course${
            selectedCourses.length > 1 ? "s" : ""
          }`;

    const typesText =
      selectedTypes.length === 0 ||
      selectedTypes.length === CONTENT_TYPES.length
        ? "all content"
        : selectedTypes
            .map((typeId) => {
              const type = CONTENT_TYPES.find((t) => t.id === typeId);
              return type?.name.toLowerCase();
            })
            .join(", ");

    return `Searching across ${coursesText}, ${typesText}`;
  };
  return (
    <>
      <div className="sticky bottom-0 w-full bg-primary-50 border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Selected course pills */}
          {selectedCourses.length > 0 &&
            selectedCourses.length < courses.length && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedCourses.map((courseId) => {
                  const course = courses.find((c) => c._id === courseId);
                  if (!course) return null;
                  return (
                    <span
                      key={courseId}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        course.courseColorTailwind
                      }`}
                    >
                      {course.name}
                    </span>
                  );
                })}
              </div>
            )}
          {/* Selected type pills */}
          {selectedTypes.length > 0 &&
            selectedTypes.length < CONTENT_TYPES.length && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedTypes.map((typeId) => {
                  const type = CONTENT_TYPES.find((t) => t.id === typeId);
                  if (!type) return null;
                  const IconComponent = iconForTypeLucide(type.icon);
                  return (
                    <span
                      key={typeId}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 border border-primary-300 flex items-center gap-1"
                    >
                      <IconComponent className="w-3 h-3" />
                      {type.name}
                    </span>
                  );
                })}
              </div>
            )}
          {/* Course & Content type selectors */}
          <div className="flex items-center gap-3">
            {/* Left side - Filter selectors */}
            <div className="flex gap-2">
              <MultiSelect
                options={courses.map((c) => ({
                  value: c._id.toString(),
                  label: c.name,
                }))}
                selected={selectedCourses}
                onChange={onCoursesChange}
                placeholder="Courses"
                icon={<BookOpen className="w-5 h-5 text-gray-600" />}
                className="w-10 h-10"
              />
              <MultiSelect
                options={CONTENT_TYPES.map((t) => ({
                  value: t.id,
                  label: t.name,
                }))}
                selected={selectedTypes}
                onChange={onTypesChange}
                placeholder="Content types"
                icon={<Tag className="w-5 h-5 text-gray-600" />}
                className="w-10 h-10"
              />
            </div>

            {/* Center - Textarea */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent bg-secondary-50 placeholder-gray-500"
                placeholder="Message LISA..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={disabled}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                style={{ minHeight: "60px", maxHeight: "200px" }}
              />
            </div>

            {/* Right side - Send button */}
            <button
              type="button"
              onClick={handleSend}
              className="primarybutton p-3 rounded-xl flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disabled || !input.trim()}
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>

          {/* Search context text below textarea */}
          <div className="mt-2 text-xs text-gray-500">
            {getSearchContextText()}
          </div>
        </div>
      </div>
    </>
  );
}

function InitialSplash({
  userName,
  userType,
  onQuickAction,
}: {
  userName: string;
  userType: string;
  onQuickAction: (action: string) => void;
}) {
  // Replace PiChatTeardrop with lucide MessageCircle
  // Use iconForTypeLucide for quick actions

  const AssignmentIcon = iconForTypeLucide("assignment");
  const QuizIcon = iconForTypeLucide("quiz");
  const ContentIcon = iconForTypeLucide("content");

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 text-gray-500">
      <div className="text-center max-w-md mb-8">
        <div className="flex items-center justify-center mb-4">
          <MessageCircle size={48} className="text-primary-600" />
          <span className="text-3xl tracking-wider font-bold text-primary-700 ml-2">
            LISA
          </span>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Hi, {userName}
        </h2>
        <p className="text-gray-500 mb-8">What can I help you with today?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl w-full">
        <button
          onClick={() => onQuickAction("What assignments are due this week?")}
          className="p-4 rounded-xl text-sm font-medium text-left hover:bg-primary-100 hover:text-primary-700 cursor-pointer"
        >
          <div className="mb-2">
            <AssignmentIcon className="w-6 h-6" />
          </div>
          {userType === "student"
            ? "What assignments are due this week?"
            : "Show my students' assignments"}
        </button>
        <button
          onClick={() => onQuickAction("Show my upcoming quizzes")}
          className="p-4 rounded-xl text-sm font-medium text-left hover:bg-primary-100 hover:text-primary-700 cursor-pointer"
        >
          <div className="mb-2">
            <QuizIcon className="w-6 h-6" />
          </div>
          {userType === "student"
            ? "Show my upcoming quizzes?"
            : "Show the latest quizzes"}
        </button>
        <button
          onClick={() => onQuickAction("Show recently uploaded class content")}
          className="p-4 rounded-xl text-sm font-medium text-left hover:bg-primary-100 hover:text-primary-700 cursor-pointer"
        >
          <div className="mb-2">
            <ContentIcon className="w-6 h-6" />
          </div>
          {userType === "student"
            ? "Show recently uploaded class content"
            : "Show the class content uploaded yesterday"}
        </button>
      </div>
    </div>
  );
}

function LisaPageContent({
  initialMessages,
  initialQuestion,
  session,
  userData,
  courses,
}: {
  initialMessages?: Message[];
  initialQuestion?: string;
  session: AuthenticatedSession;
  userData: UserData;
  courses: Course[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Remove useSearchParams from here
  const handleSend = async (msg: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: msg,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const context = {
        courseIds:
          selectedCourses.length > 0
            ? selectedCourses
            : courses.map((c) => c._id),
        contentTypes:
          selectedTypes.length > 0
            ? selectedTypes
            : CONTENT_TYPES.map((t) => t.id),
        userId: session.user.id,
        query: msg,
      };
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("API call failed");
        console.log("Status:", response.status);
        console.log("Status Text:", response.statusText);
        console.log("Response:", errorText);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Sorry, I encountered an error: ${response.statusText} (${response.status}). Please try again.`,
          sender: "lisa",
          timestamp: new Date(),
          type: "error",
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      const data = await response.json();

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer,
        sender: "lisa",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: "Sorry, I couldn't get a response from LISA. There might be a network issue.",
          sender: "lisa",
          timestamp: new Date(),
          type: "error",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Accept initialQuestion as prop
  const question: string = initialQuestion || "";
  const hasSentInitialQuestion = useRef(false);
  useEffect(() => {
    if (question && messages.length === 0 && !hasSentInitialQuestion.current) {
      handleSend(question);
      hasSentInitialQuestion.current = true;
    }
  }, [question, messages.length]);

  const userName = session?.user?.name || "Student";

  return (
    <>
      <SetHeaderClientComponent title="LISA" />
      <div className="mx-auto w-full max-w-4xl flex flex-col min-h-screen bg-primary-50">
        {/* Main scrollable content area */}
        <div className="flex-1">
          {messages.length === 0 ? (
            <InitialSplash
              userName={userName}
              userType={userData.role}
              onQuickAction={handleSend}
            />
          ) : (
            <MessageList messages={messages} />
          )}

          {isLoading && (
            <div className="w-full px-6 py-3 text-center text-primary-600 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span>LISA is thinking...</span>
            </div>
          )}
        </div>

        {/* Sticky chat input */}
        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
          selectedCourses={selectedCourses}
          selectedTypes={selectedTypes}
          onCoursesChange={setSelectedCourses}
          onTypesChange={setSelectedTypes}
          courses={courses}
        />
      </div>
    </>
  );
}

export default function LisaClientComponent({
  session,
  userData,
  courses,
}: {
  session: AuthenticatedSession;
  userData: UserData;
  courses: Course[];
}) {
  const searchParams = useSearchParams();
  const question = searchParams ? searchParams.get("question") || "" : "";
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LisaPageContent
        initialQuestion={question}
        session={session}
        userData={userData}
        courses={courses}
      />
    </Suspense>
  );
}
