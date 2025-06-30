"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SetHeaderClientComponent from "@/components/feature/header/set-header-client-component";
import { useSession } from "next-auth/react";
import { PiChatTeardrop, PiCaretUp, PiBooks, PiTag } from "react-icons/pi";
import { iconForType } from "@/lib/constants";
import { MultiSelect } from "@/components/core/multi-select";

interface Message {
  id: string;
  text: string;
  sender: "user" | "lisa";
  timestamp: Date;
  type?: "assignment" | "quiz" | "lecture" | "material" | "general";
  course?: string;
}

interface FilterState {
  assignments: boolean;
  quizzes: boolean;
  lectures: boolean;
  materials: boolean;
}

interface Course {
  id: string;
  name: string;
  color: keyof typeof COURSE_COLORS;
}

interface ContentType {
  id: string;
  name: string;
  icon: string;
}

const COURSE_COLORS = {
  blue: "bg-primary-100 text-primary-700 border-primary-300",
  green: "bg-secondary-100 text-secondary-700 border-secondary-300",
  rose: "bg-accent-100 text-accent-700 border-accent-300",
  purple: "bg-primary-200 text-primary-800 border-primary-400",
  brown: "bg-secondary-200 text-secondary-800 border-secondary-400",
  red: "bg-accent-200 text-accent-800 border-accent-400",
};

const MOCK_COURSES: Course[] = [
  { id: "cs101", name: "Computer Science 101", color: "blue" },
  { id: "math201", name: "Calculus II", color: "green" },
  { id: "phys101", name: "Physics I", color: "rose" },
  { id: "eng102", name: "English Literature", color: "purple" },
  { id: "hist201", name: "World History", color: "brown" },
];

const CONTENT_TYPES: ContentType[] = [
  { id: "assignment", name: "Assignment", icon: "assignment" },
  { id: "quiz", name: "Quiz", icon: "quiz" },
  { id: "exam", name: "Exam", icon: "exam" },
  { id: "content", name: "Content", icon: "content" },
  { id: "lab", name: "Lab", icon: "lab" },
  { id: "project", name: "Project", icon: "project" },
  { id: "announcement", name: "Announcement", icon: "announcement" },
];

function MessageList({ messages }: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-primary-50 w-full px-6 py-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((message) => (
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
        ))}
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
}: {
  onSend: (msg: string) => void;
  disabled: boolean;
  selectedCourses: string[];
  selectedTypes: string[];
  onCoursesChange: (selected: string[]) => void;
  onTypesChange: (selected: string[]) => void;
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
      selectedCourses.length === 0 ||
      selectedCourses.length === MOCK_COURSES.length
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
            selectedCourses.length < MOCK_COURSES.length && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedCourses.map((courseId) => {
                  const course = MOCK_COURSES.find((c) => c.id === courseId);
                  if (!course) return null;
                  return (
                    <span
                      key={courseId}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        COURSE_COLORS[course.color]
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
                  const IconComponent = iconForType(type.icon);
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
                options={MOCK_COURSES.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                selected={selectedCourses}
                onChange={onCoursesChange}
                placeholder="Courses"
                icon={<PiBooks className="w-5 h-5 text-gray-600" />}
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
                icon={<PiTag className="w-5 h-5 text-gray-600" />}
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
              <PiCaretUp className="w-5 h-5" />
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
  onQuickAction,
}: {
  userName: string;
  onQuickAction: (action: string) => void;
}) {
  const AssignmentIcon = iconForType("assignment");
  const QuizIcon = iconForType("quiz");
  const ContentIcon = iconForType("content");

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 text-gray-500">
      <div className="text-center max-w-md mb-8">
        <div className="flex items-center justify-center mb-4">
          <PiChatTeardrop size={48} className="text-primary-600" />
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
          className="secondarybutton p-4 rounded-xl text-sm font-medium text-left hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-all"
        >
          <div className="mb-2">
            <AssignmentIcon className="w-6 h-6" />
          </div>
          What assignments are due this week?
        </button>
        <button
          onClick={() => onQuickAction("Show my upcoming quizzes")}
          className="secondarybutton p-4 rounded-xl text-sm font-medium text-left hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-all"
        >
          <div className="mb-2">
            <QuizIcon className="w-6 h-6" />
          </div>
          Show my upcoming quizzes
        </button>
        <button
          onClick={() => onQuickAction("Show recently uploaded class content")}
          className="secondarybutton p-4 rounded-xl text-sm font-medium text-left hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-all"
        >
          <div className="mb-2">
            <ContentIcon className="w-6 h-6" />
          </div>
          Show recently uploaded class content
        </button>
      </div>
    </div>
  );
}

function LisaPageContent({
  initialMessages,
  initialQuestion,
}: {
  initialMessages?: Message[];
  initialQuestion?: string;
}) {
  const session = useSession();
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Remove useSearchParams from here

  // Accept initialQuestion as prop
  const question: string = initialQuestion || "";
  const hasSentInitialQuestion = useRef(false);
  useEffect(() => {
    if (question && messages.length === 0 && !hasSentInitialQuestion.current) {
      handleSend(question);
      hasSentInitialQuestion.current = true;
    }
  }, [question, messages.length]);

  const userName = session?.data?.user?.name || "Student";

  const handleToggleCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleToggleType = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    );
  };

  const generateMockResponse = (userMessage: string): Message => {
    let type: Message["type"] = "general";
    let text = "";
    let course: string | undefined;

    // Determine response type based on selected types or message content
    if (selectedTypes.length > 0) {
      const typeMap: { [key: string]: Message["type"] } = {
        assignment: "assignment",
        quiz: "quiz",
        exam: "quiz",
        content: "material",
        lab: "material",
        project: "assignment",
        announcement: "general",
      };
      type = typeMap[selectedTypes[0]] || "general";
    } else if (userMessage.toLowerCase().includes("assignment")) {
      type = "assignment";
    } else if (userMessage.toLowerCase().includes("quiz")) {
      type = "quiz";
    } else if (userMessage.toLowerCase().includes("lecture")) {
      type = "lecture";
    } else if (userMessage.toLowerCase().includes("material")) {
      type = "material";
    }

    // Select a course if any are selected
    if (selectedCourses.length > 0) {
      course =
        selectedCourses[Math.floor(Math.random() * selectedCourses.length)];
    }

    // Generate appropriate response
    switch (type) {
      case "assignment":
        text = `Here are your upcoming assignments${
          course
            ? ` for ${MOCK_COURSES.find((c) => c.id === course)?.name}`
            : ""
        }:\n\n• Essay on Modern Literature - Due Friday\n• Math Problem Set 7 - Due Monday\n• Physics Lab Report - Due Wednesday\n\nWould you like more details on any of these?`;
        break;
      case "quiz":
        text = `Your upcoming quizzes${
          course
            ? ` for ${MOCK_COURSES.find((c) => c.id === course)?.name}`
            : ""
        }:\n\n• History Quiz Ch. 12-15 - Tomorrow at 2 PM\n• Biology Quiz on Cell Structure - Friday\n\nI can help you review the key topics. What would you like to focus on?`;
        break;
      case "lecture":
        text = `Recent lectures${
          course
            ? ` from ${MOCK_COURSES.find((c) => c.id === course)?.name}`
            : ""
        }:\n\n• Introduction to Quantum Physics - Today\n• Shakespearean Sonnets Analysis - Yesterday\n• Calculus Integration Methods - Monday\n\nWould you like a summary of any specific lecture?`;
        break;
      case "material":
        text = `Study materials${
          course
            ? ` for ${MOCK_COURSES.find((c) => c.id === course)?.name}`
            : ""
        }:\n\n• Textbook Chapter 8 - Molecular Biology\n• Video Lecture Series - Advanced Calculus\n• Practice Problems - Physics Mechanics\n\nI can help explain any concepts you're struggling with!`;
        break;
      default:
        text = `I understand you're asking about your studies. I can help you with:\n\n• Finding assignments and due dates\n• Quiz preparation and review\n• Lecture summaries and notes\n• Study materials and resources\n\nWhat specific area would you like to explore?`;
    }

    return {
      id: (Date.now() + 1).toString(),
      text,
      sender: "lisa",
      timestamp: new Date(),
      type,
      course,
    };
  };

  const handleSend = (msg: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: msg,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      const aiResponse = generateMockResponse(msg);
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1200);
  };

  const handleQuickAction = (action: string) => {
    handleSend(action);
  };

  return (
    <>
      <SetHeaderClientComponent title="LISA" />
      <div className="mx-auto w-full max-w-4xl flex flex-col min-h-screen bg-primary-50">
        {/* Main scrollable content area */}
        <div className="flex-1">
          {messages.length === 0 ? (
            <InitialSplash userName={userName} onQuickAction={handleSend} />
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
        />
      </div>
    </>
  );
}

// New client component to extract searchParams
function LisaPageSearchParamsWrapper() {
  "use client";
  const searchParams = useSearchParams();
  const question = searchParams ? searchParams.get("question") || "" : "";
  return <LisaPageContent initialQuestion={question} />;
}

export default function LisaPage() {
  // Wrap client component in Suspense
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LisaPageSearchParamsWrapper />
    </Suspense>
  );
}
