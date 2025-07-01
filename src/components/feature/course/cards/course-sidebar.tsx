import { Course } from "@/lib/schemas/database";
import {
  FiDownload,
  FiFileText,
  FiUsers,
  FiBookOpen,
  FiClipboard,
  FiBarChart2,
  FiMessageSquare,
} from "react-icons/fi";

interface CourseSidebarProps {
  course: Course;
}

// Dummy data for demonstration
const courseMaterials = [
  {
    id: 1,
    name: "Course Syllabus.pdf",
    type: "pdf",
    size: "2.3 MB",
    uploadDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Lecture 1 - Introduction.pdf",
    type: "pdf",
    size: "5.1 MB",
    uploadDate: "2024-01-20",
  },
  {
    id: 3,
    name: "Lab Manual.pdf",
    type: "pdf",
    size: "8.7 MB",
    uploadDate: "2024-01-18",
  },
  {
    id: 4,
    name: "Assignment Guidelines.docx",
    type: "doc",
    size: "1.2 MB",
    uploadDate: "2024-01-22",
  },
];

const assignments = [
  {
    id: 1,
    name: "Assignment 1: Basic Concepts",
    due: "2024-02-15",
    status: "pending",
    grade: null,
  },
  {
    id: 2,
    name: "Assignment 2: Data Structures",
    due: "2024-03-01",
    status: "submitted",
    grade: "85%",
  },
  {
    id: 3,
    name: "Mid-term Project",
    due: "2024-03-15",
    status: "graded",
    grade: "92%",
  },
];

const pollsAndAnnouncements = [
  {
    id: 1,
    type: "poll",
    question: "What's your preferred programming language?",
    responses: 45,
    active: true,
  },
  {
    id: 2,
    type: "poll",
    question: "Rate the difficulty of last week's content",
    responses: 38,
    active: false,
  },
  {
    id: 3,
    type: "announcement",
    question: "Class cancelled tomorrow due to holiday",
    responses: null,
    active: false,
  },
  {
    id: 4,
    type: "announcement",
    question: "New assignment uploaded - check materials section",
    responses: null,
    active: false,
  },
];

export default function CourseSidebar({}: CourseSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="bg-primary-50 rounded-xl shadow border border-primary-100 p-4">
        <h3 className="font-semibold text-primary-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-2 p-2 text-sm bg-secondary-50 text-secondary-700 rounded-lg hover:bg-secondary-100 transition-colors cursor-pointer">
            <FiUsers className="w-4 h-4" />
            Students
          </button>
          <button className="flex items-center justify-center gap-2 p-2 text-sm bg-success-50 text-success-700 rounded-lg hover:bg-success-100 transition-colors cursor-pointer">
            <FiBookOpen className="w-4 h-4" />
            Materials
          </button>
          <button className="flex items-center justify-center gap-2 p-2 text-sm bg-primary-200 text-primary-800 rounded-lg hover:bg-primary-300 transition-colors cursor-pointer">
            <FiClipboard className="w-4 h-4" />
            Assignments
          </button>
          <button className="flex items-center justify-center gap-2 p-2 text-sm bg-accent-50 text-accent-700 rounded-lg hover:bg-accent-100 transition-colors cursor-pointer">
            <FiBarChart2 className="w-4 h-4" />
            Grades
          </button>
        </div>
      </div>

      {/* Course Materials */}
      <div className="bg-primary-50 rounded-xl shadow border border-primary-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-primary-900">Course Materials</h3>
          <span className="text-xs text-primary-500">
            {courseMaterials.length} files
          </span>
        </div>
        <div className="space-y-2">
          {courseMaterials.map((material) => (
            <div
              key={material.id}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <FiFileText className="w-4 h-4 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {material.name}
                </p>
                <p className="text-xs text-gray-500">{material.size}</p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all">
                <FiDownload className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Assignments */}
      <div className="bg-primary-50 rounded-xl shadow border border-primary-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-primary-900">Assignments</h3>
          <span className="text-xs text-primary-500">
            {assignments.length} total
          </span>
        </div>
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="border-l-4 border-secondary-300 pl-3 py-2"
            >
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                {assignment.name}
              </h4>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Due: {assignment.due}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      assignment.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : assignment.status === "submitted"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {assignment.status}
                  </span>
                  {assignment.grade && (
                    <span className="font-medium text-green-600">
                      {assignment.grade}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Polls and Announcements */}
      <div className="bg-primary-50 rounded-xl shadow border border-primary-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-primary-900">
            Polls & Announcements
          </h3>
          <span className="text-xs text-primary-500">
            {pollsAndAnnouncements.filter((p) => p.active).length} active
          </span>
        </div>
        <div className="space-y-3">
          {pollsAndAnnouncements.map((item) => (
            <div
              key={item.id}
              className="p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-medium text-gray-900">
                  {item.question}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      item.type === "poll"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {item.type}
                  </span>
                  {item.active && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiMessageSquare className="w-3 h-3" />
                <span>
                  {item.responses
                    ? `${item.responses} responses`
                    : "No responses"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
