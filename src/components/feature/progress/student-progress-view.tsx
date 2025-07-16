"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  BookOpen,
  TrendingUp,
  Clock,
  Target,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { MyMarkdown } from "@/components/core/markdown";

interface StudentProgressViewProps {
  studentId: string;
}

interface CourseOverview {
  courseId: string;
  courseName: string;
  courseCode: string;
  shortDescription: string;
  completionPercentage: number;
  averageGrade: number;
  totalAssignments: number;
  submittedAssignments: number;
  gradedAssignments: number;
}

interface AssignmentDetail {
  assignmentId: string;
  title: string;
  description: string;
  topics: string[];
  dueDate: string | null;
  grade: number | null;
  submissionDate: string | null;
  status: "submitted" | "late" | "overdue";
  totalPoints: number;
  gradingType: string;
}

interface CourseDetails {
  courseId: string;
  courseName: string;
  courseCode: string;
  completionPercentage: number;
  averageGrade: number;
  totalAssignments: number;
  submittedAssignments: number;
  gradedAssignments: number;
}

const chartConfig = {
  grade: {
    label: "Grade %",
    color: "var(--color-chart-1)",
  },
  completion: {
    label: "Completion %",
    color: "var(--color-chart-2)",
  },
  submitted: {
    label: "Submitted",
    color: "var(--color-chart-1)",
  },
  missing: {
    label: "Missing",
    color: "var(--color-chart-5)",
  },
};

export default function StudentProgressView({
  studentId,
}: StudentProgressViewProps) {
  const [courses, setCourses] = useState<CourseOverview[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(
    null
  );
  const [assignments, setAssignments] = useState<AssignmentDetail[]>([]);
  const [improvementTips, setImprovementTips] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch enrolled courses overview
  useEffect(() => {
    const fetchCoursesOverview = async () => {
      try {
        setError(null);

        // Demo data for presentation purposes
        const dummyCourses = [
          {
            courseId: "1",
            courseName: "Introduction to Computer Science",
            courseCode: "CS101",
            shortDescription:
              "Fundamentals of programming and computational thinking",
            completionPercentage: 85,
            averageGrade: 88,
            totalAssignments: 12,
            submittedAssignments: 10,
            gradedAssignments: 8,
          },
          {
            courseId: "2",
            courseName: "Data Structures and Algorithms",
            courseCode: "CS201",
            shortDescription:
              "Advanced programming concepts and algorithmic thinking",
            completionPercentage: 73,
            averageGrade: 92,
            totalAssignments: 15,
            submittedAssignments: 11,
            gradedAssignments: 9,
          },
          {
            courseId: "3",
            courseName: "Web Development Fundamentals",
            courseCode: "WEB101",
            shortDescription:
              "HTML, CSS, JavaScript and modern web technologies",
            completionPercentage: 91,
            averageGrade: 95,
            totalAssignments: 8,
            submittedAssignments: 8,
            gradedAssignments: 7,
          },
          {
            courseId: "4",
            courseName: "Database Systems",
            courseCode: "DB301",
            shortDescription:
              "Relational databases, SQL, and database design principles",
            completionPercentage: 67,
            averageGrade: 78,
            totalAssignments: 10,
            submittedAssignments: 7,
            gradedAssignments: 6,
          },
        ];

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setCourses(dummyCourses);
      } catch (error) {
        console.error("Error fetching courses overview:", error);
        setError("Network error occurred while fetching courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesOverview();
  }, [studentId]);

  // Fetch course details when a course is selected
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchCourseDetails = async () => {
      try {
        setError(null);

        // Demo course details data
        const courseDetailsMap: Record<
          string,
          {
            courseDetails: CourseDetails;
            assignments: AssignmentDetail[];
          }
        > = {
          "1": {
            courseDetails: {
              courseId: "1",
              courseName: "Introduction to Computer Science",
              courseCode: "CS101",
              completionPercentage: 85,
              averageGrade: 88,
              totalAssignments: 12,
              submittedAssignments: 10,
              gradedAssignments: 8,
            },
            assignments: [
              {
                assignmentId: "1a",
                title: "Hello World Program",
                description:
                  "Write your first program that prints 'Hello, World!' to the console",
                topics: ["Programming Basics", "Output"],
                dueDate: "2024-09-15T23:59:00Z",
                grade: 95,
                submissionDate: "2024-09-14T18:30:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "1b",
                title: "Variables and Data Types",
                description:
                  "Demonstrate understanding of different data types and variable declarations",
                topics: ["Variables", "Data Types", "Memory"],
                dueDate: "2024-09-22T23:59:00Z",
                grade: 87,
                submissionDate: "2024-09-22T20:45:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "1c",
                title: "Control Flow Structures",
                description:
                  "Implement loops and conditional statements to solve basic problems",
                topics: ["Loops", "Conditionals", "Control Flow"],
                dueDate: "2024-09-29T23:59:00Z",
                grade: 82,
                submissionDate: "2024-09-30T02:15:00Z",
                status: "late",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "1d",
                title: "Function Implementation",
                description:
                  "Create reusable functions to organize code effectively",
                topics: ["Functions", "Parameters", "Return Values"],
                dueDate: "2024-10-06T23:59:00Z",
                grade: null,
                submissionDate: null,
                status: "overdue",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "1e",
                title: "Array Manipulation",
                description:
                  "Work with arrays to store and process collections of data",
                topics: ["Arrays", "Iteration", "Data Structures"],
                dueDate: "2024-10-13T23:59:00Z",
                grade: 78,
                submissionDate: "2024-10-13T22:30:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "1f",
                title: "String Processing",
                description:
                  "Manipulate strings and understand text processing fundamentals",
                topics: ["Strings", "Text Processing", "Algorithms"],
                dueDate: "2024-10-20T23:59:00Z",
                grade: 92,
                submissionDate: "2024-10-19T16:45:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "1g",
                title: "File Input/Output Operations",
                description:
                  "Read from and write to files using proper file handling techniques",
                topics: ["File I/O", "Error Handling", "Data Persistence"],
                dueDate: "2024-10-27T23:59:00Z",
                grade: 85,
                submissionDate: "2024-10-27T21:10:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "1h",
                title: "Object-Oriented Programming Basics",
                description:
                  "Introduction to classes, objects, and encapsulation principles",
                topics: ["OOP", "Classes", "Objects", "Encapsulation"],
                dueDate: "2024-11-03T23:59:00Z",
                grade: 89,
                submissionDate: "2024-11-02T19:20:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "1i",
                title: "Exception Handling",
                description:
                  "Learn to handle errors gracefully using try-catch mechanisms",
                topics: ["Exceptions", "Error Handling", "Debugging"],
                dueDate: "2024-11-10T23:59:00Z",
                grade: 93,
                submissionDate: "2024-11-09T20:15:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "1j",
                title: "Final Project - Calculator App",
                description:
                  "Build a complete calculator application using all learned concepts",
                topics: ["Project", "Integration", "User Interface", "Testing"],
                dueDate: "2024-11-17T23:59:00Z",
                grade: null,
                submissionDate: null,
                status: "overdue",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "1k",
                title: "Code Review and Refactoring",
                description:
                  "Review and improve existing code for better readability and efficiency",
                topics: ["Code Review", "Refactoring", "Best Practices"],
                dueDate: "2024-11-24T23:59:00Z",
                grade: null,
                submissionDate: null,
                status: "overdue",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "1l",
                title: "Algorithm Analysis",
                description:
                  "Analyze time and space complexity of different algorithms",
                topics: ["Algorithms", "Complexity", "Performance"],
                dueDate: "2024-12-01T23:59:00Z",
                grade: null,
                submissionDate: null,
                status: "overdue",
                totalPoints: 100,
                gradingType: "percentage",
              },
            ],
          },
          "2": {
            courseDetails: {
              courseId: "2",
              courseName: "Data Structures and Algorithms",
              courseCode: "CS201",
              completionPercentage: 73,
              averageGrade: 92,
              totalAssignments: 15,
              submittedAssignments: 11,
              gradedAssignments: 9,
            },
            assignments: [
              {
                assignmentId: "2a",
                title: "Array Operations",
                description: "Implement basic array operations and algorithms",
                topics: ["Arrays", "Searching", "Sorting"],
                dueDate: "2024-09-20T23:59:00Z",
                grade: 98,
                submissionDate: "2024-09-19T16:20:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "2b",
                title: "Linked List Implementation",
                description:
                  "Build a complete linked list data structure from scratch",
                topics: ["Linked Lists", "Pointers", "Memory Management"],
                dueDate: "2024-09-27T23:59:00Z",
                grade: 94,
                submissionDate: "2024-09-26T22:10:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "2c",
                title: "Stack and Queue Operations",
                description:
                  "Implement stack and queue data structures with practical applications",
                topics: ["Stacks", "Queues", "LIFO", "FIFO"],
                dueDate: "2024-10-04T23:59:00Z",
                grade: 89,
                submissionDate: "2024-10-04T21:30:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "2d",
                title: "Binary Search Trees",
                description:
                  "Implement BST with insertion, deletion, and traversal operations",
                topics: ["Trees", "Binary Search", "Recursion"],
                dueDate: "2024-10-11T23:59:00Z",
                grade: 91,
                submissionDate: "2024-10-10T23:45:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "2e",
                title: "Hash Table Implementation",
                description:
                  "Build a hash table with collision resolution strategies",
                topics: ["Hashing", "Collision Resolution", "Performance"],
                dueDate: "2024-10-18T23:59:00Z",
                grade: 87,
                submissionDate: "2024-10-19T01:20:00Z",
                status: "late",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "2f",
                title: "Graph Representation and Traversal",
                description:
                  "Implement graph data structure with BFS and DFS algorithms",
                topics: ["Graphs", "BFS", "DFS", "Traversal"],
                dueDate: "2024-10-25T23:59:00Z",
                grade: 96,
                submissionDate: "2024-10-24T20:30:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "2g",
                title: "Heap and Priority Queue",
                description:
                  "Implement min/max heap and priority queue operations",
                topics: ["Heaps", "Priority Queues", "Tree Properties"],
                dueDate: "2024-11-01T23:59:00Z",
                grade: 92,
                submissionDate: "2024-11-01T19:15:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "2h",
                title: "Sorting Algorithm Comparison",
                description:
                  "Implement and compare performance of various sorting algorithms",
                topics: ["Sorting", "Algorithm Analysis", "Performance"],
                dueDate: "2024-11-08T23:59:00Z",
                grade: 95,
                submissionDate: "2024-11-07T22:00:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "2i",
                title: "Dynamic Programming Solutions",
                description:
                  "Solve complex problems using dynamic programming techniques",
                topics: ["Dynamic Programming", "Optimization", "Memoization"],
                dueDate: "2024-11-15T23:59:00Z",
                grade: 88,
                submissionDate: "2024-11-15T23:30:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "2j",
                title: "Advanced Graph Algorithms",
                description:
                  "Implement Dijkstra's algorithm and minimum spanning tree",
                topics: ["Graph Algorithms", "Shortest Path", "MST"],
                dueDate: "2024-11-22T23:59:00Z",
                grade: 90,
                submissionDate: "2024-11-22T21:45:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "2k",
                title: "String Algorithms",
                description:
                  "Implement pattern matching and string manipulation algorithms",
                topics: ["String Algorithms", "Pattern Matching", "KMP"],
                dueDate: "2024-11-29T23:59:00Z",
                grade: null,
                submissionDate: null,
                status: "overdue",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "2l",
                title: "Data Structure Design Project",
                description:
                  "Design and implement a custom data structure for a real-world problem",
                topics: [
                  "Design",
                  "Implementation",
                  "Testing",
                  "Documentation",
                ],
                dueDate: "2024-12-06T23:59:00Z",
                grade: null,
                submissionDate: null,
                status: "overdue",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "2m",
                title: "Algorithm Complexity Analysis",
                description:
                  "Analyze and optimize the time and space complexity of algorithms",
                topics: ["Complexity Analysis", "Big O", "Optimization"],
                dueDate: "2024-12-13T23:59:00Z",
                grade: null,
                submissionDate: null,
                status: "overdue",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "2n",
                title: "Final Algorithm Portfolio",
                description:
                  "Create a comprehensive portfolio of all implemented algorithms",
                topics: ["Portfolio", "Documentation", "Code Review"],
                dueDate: "2024-12-20T23:59:00Z",
                grade: null,
                submissionDate: null,
                status: "overdue",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "2o",
                title: "Performance Benchmarking",
                description:
                  "Benchmark and compare the performance of different data structures",
                topics: ["Benchmarking", "Performance", "Analysis"],
                dueDate: "2024-12-27T23:59:00Z",
                grade: null,
                submissionDate: null,
                status: "overdue",
                totalPoints: 100,
                gradingType: "percentage",
              },
            ],
          },
          "3": {
            courseDetails: {
              courseId: "3",
              courseName: "Web Development Fundamentals",
              courseCode: "WEB101",
              completionPercentage: 91,
              averageGrade: 95,
              totalAssignments: 8,
              submittedAssignments: 8,
              gradedAssignments: 7,
            },
            assignments: [
              {
                assignmentId: "3a",
                title: "HTML Structure and Semantics",
                description:
                  "Create semantic HTML documents with proper structure and accessibility",
                topics: ["HTML", "Semantics", "Accessibility"],
                dueDate: "2024-09-18T23:59:00Z",
                grade: 97,
                submissionDate: "2024-09-17T19:30:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "3b",
                title: "CSS Styling and Layout",
                description:
                  "Style web pages using CSS with flexbox and grid layouts",
                topics: ["CSS", "Flexbox", "Grid", "Responsive Design"],
                dueDate: "2024-09-25T23:59:00Z",
                grade: 94,
                submissionDate: "2024-09-24T21:15:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "3c",
                title: "JavaScript DOM Manipulation",
                description:
                  "Add interactivity to web pages using JavaScript and DOM APIs",
                topics: ["JavaScript", "DOM", "Events", "Interactivity"],
                dueDate: "2024-10-02T23:59:00Z",
                grade: 96,
                submissionDate: "2024-10-01T20:00:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "3d",
                title: "Responsive Web Design",
                description:
                  "Create mobile-first responsive designs using media queries",
                topics: ["Responsive Design", "Media Queries", "Mobile-First"],
                dueDate: "2024-10-09T23:59:00Z",
                grade: 98,
                submissionDate: "2024-10-08T18:45:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "3e",
                title: "Form Validation and User Input",
                description:
                  "Implement client-side form validation with JavaScript",
                topics: ["Forms", "Validation", "User Input", "JavaScript"],
                dueDate: "2024-10-16T23:59:00Z",
                grade: 93,
                submissionDate: "2024-10-16T22:30:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "3f",
                title: "API Integration and Fetch",
                description:
                  "Integrate external APIs using JavaScript fetch and async/await",
                topics: ["APIs", "Fetch", "Async/Await", "JSON"],
                dueDate: "2024-10-23T23:59:00Z",
                grade: 95,
                submissionDate: "2024-10-22T20:15:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "3g",
                title: "CSS Animations and Transitions",
                description:
                  "Create smooth animations and transitions using CSS",
                topics: ["CSS Animations", "Transitions", "Keyframes"],
                dueDate: "2024-10-30T23:59:00Z",
                grade: 92,
                submissionDate: "2024-10-29T23:00:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "3h",
                title: "Portfolio Website Project",
                description:
                  "Build a complete portfolio website showcasing all learned skills",
                topics: ["Portfolio", "Project", "Integration", "Design"],
                dueDate: "2024-11-06T23:59:00Z",
                grade: null,
                submissionDate: null,
                status: "overdue",
                totalPoints: 100,
                gradingType: "percentage",
              },
            ],
          },
          "4": {
            courseDetails: {
              courseId: "4",
              courseName: "Database Systems",
              courseCode: "DB301",
              completionPercentage: 67,
              averageGrade: 78,
              totalAssignments: 10,
              submittedAssignments: 7,
              gradedAssignments: 6,
            },
            assignments: [
              {
                assignmentId: "4a",
                title: "Database Design and ER Diagrams",
                description:
                  "Design a database schema using Entity-Relationship diagrams",
                topics: ["Database Design", "ER Diagrams", "Normalization"],
                dueDate: "2024-09-21T23:59:00Z",
                grade: 85,
                submissionDate: "2024-09-20T22:00:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "4b",
                title: "SQL Basics and Data Retrieval",
                description:
                  "Write basic SQL queries for data retrieval and filtering",
                topics: ["SQL", "SELECT", "WHERE", "JOIN"],
                dueDate: "2024-09-28T23:59:00Z",
                grade: 79,
                submissionDate: "2024-09-28T23:45:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "4c",
                title: "Advanced SQL Queries",
                description:
                  "Complex queries with subqueries, aggregation, and window functions",
                topics: [
                  "SQL",
                  "Subqueries",
                  "Aggregation",
                  "Window Functions",
                ],
                dueDate: "2024-10-05T23:59:00Z",
                grade: 72,
                submissionDate: "2024-10-06T01:30:00Z",
                status: "late",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "4d",
                title: "Database Normalization",
                description: "Normalize database schemas to reduce redundancy",
                topics: ["Normalization", "1NF", "2NF", "3NF"],
                dueDate: "2024-10-12T23:59:00Z",
                grade: 81,
                submissionDate: "2024-10-11T20:15:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "4e",
                title: "Stored Procedures and Functions",
                description:
                  "Create stored procedures and functions for database operations",
                topics: ["Stored Procedures", "Functions", "PL/SQL"],
                dueDate: "2024-10-19T23:59:00Z",
                grade: 78,
                submissionDate: "2024-10-19T23:50:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "4f",
                title: "Database Security and Access Control",
                description:
                  "Implement security measures and user access control",
                topics: ["Security", "Access Control", "Permissions"],
                dueDate: "2024-10-26T23:59:00Z",
                grade: 83,
                submissionDate: "2024-10-25T19:30:00Z",
                status: "submitted",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "4g",
                title: "Transaction Management",
                description:
                  "Understand and implement database transactions and ACID properties",
                topics: ["Transactions", "ACID", "Concurrency"],
                dueDate: "2024-11-02T23:59:00Z",
                grade: 75,
                submissionDate: "2024-11-03T02:15:00Z",
                status: "late",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "4h",
                title: "Database Performance Optimization",
                description:
                  "Optimize database queries and implement proper indexing",
                topics: ["Performance", "Indexing", "Query Optimization"],
                dueDate: "2024-11-09T23:59:00Z",
                grade: null,
                submissionDate: null,
                status: "overdue",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "4i",
                title: "NoSQL Database Integration",
                description:
                  "Work with NoSQL databases and understand their use cases",
                topics: ["NoSQL", "MongoDB", "Document Stores"],
                dueDate: "2024-11-16T23:59:00Z",
                grade: null,
                submissionDate: null,
                status: "overdue",
                totalPoints: 100,
                gradingType: "percentage",
              },
              {
                assignmentId: "4j",
                title: "Database Migration and Backup",
                description:
                  "Implement database migration strategies and backup procedures",
                topics: ["Migration", "Backup", "Recovery"],
                dueDate: "2024-11-23T23:59:00Z",
                grade: null,
                submissionDate: null,
                status: "overdue",
                totalPoints: 100,
                gradingType: "percentage",
              },
            ],
          },
        };

        const data = courseDetailsMap[selectedCourse] || {
          courseDetails: {
            courseId: selectedCourse,
            courseName: "Sample Course",
            courseCode: "DEMO101",
            completionPercentage: 75,
            averageGrade: 85,
            totalAssignments: 8,
            submittedAssignments: 6,
            gradedAssignments: 5,
          },
          assignments: [],
        };

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 300));
        setCourseDetails(data.courseDetails);
        setAssignments(data.assignments || []);
        setShowCourseDetails(true);
      } catch (error) {
        console.error("Error fetching course details:", error);
        setError("Network error occurred while fetching course details");
      }
    };

    fetchCourseDetails();
  }, [selectedCourse]); // Generate AI improvement tips
  const generateImprovementTips = useCallback(async () => {
    if (!selectedCourse) return;

    setTipsLoading(true);
    try {
      // Prepare context for the API: selected course and assignments
      const context = {
        course: courseDetails,
        assignments: assignments,
      };

      const response = await fetch("/api/get-tips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(context),
      });

      const receivedTips = await response.json();
      let tips;
      if (!response.ok) {
        tips = `Failed to get tips!`;
      } else {
        tips = receivedTips.data || `Failed to get tips!`;
      }
      setImprovementTips(tips);
    } catch (error) {
      console.error("Error generating improvement tips:", error);
      setImprovementTips(
        "Network error occurred while generating tips. Please check your connection and try again."
      );
    } finally {
      setTipsLoading(false);
    }
  }, [selectedCourse, assignments, courseDetails]);

  // Auto-generate tips when course details are loaded
  useEffect(() => {
    if (showCourseDetails && selectedCourse && !improvementTips) {
      generateImprovementTips();
    }
  }, [
    showCourseDetails,
    selectedCourse,
    improvementTips,
    generateImprovementTips,
  ]);

  if (loading) {
    return (
      <main className="min-h-screen bg-primary-50 p-6">
        <div className="max-w-6xl w-full mx-auto">
          <div className="space-y-6">
            <div className="animate-pulse">
              <Card className="bg-white border-primary-200 shadow-sm rounded-lg">
                <CardContent className="text-center py-16">
                  <div className="p-4 bg-primary-100 rounded-xl inline-block mb-4">
                    <BookOpen className="mx-auto h-12 w-12 text-primary-600" />
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-primary-800">
                    Loading your progress...
                  </h3>
                  <p className="mt-1 text-sm text-primary-600/70">
                    Please wait while we fetch your course data.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-primary-50 p-6">
        <div className="max-w-6xl w-full mx-auto">
          <Card className="bg-white border-danger-200 shadow-sm rounded-lg">
            <CardContent className="text-center py-16">
              <div className="p-4 bg-danger-100 rounded-xl inline-block mb-4">
                <BookOpen className="mx-auto h-12 w-12 text-danger-600" />
              </div>
              <h3 className="mt-2 text-lg font-bold text-danger-800">
                Error Loading Data
              </h3>
              <p className="mt-1 text-sm text-danger-600/70">{error}</p>
              <div className="mt-6">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-danger-600 hover:bg-danger-700 text-white"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (courses.length === 0) {
    return (
      <main className="min-h-screen bg-primary-50 p-6">
        <div className="max-w-6xl w-full mx-auto">
          <Card className="bg-white border-primary-200 shadow-sm rounded-lg">
            <CardContent className="text-center py-16">
              <div className="p-4 bg-primary-100 rounded-xl inline-block mb-4">
                <BookOpen className="mx-auto h-12 w-12 text-primary-600" />
              </div>
              <h3 className="mt-2 text-lg font-bold text-primary-800">
                No courses found
              </h3>
              <p className="mt-1 text-sm text-primary-600/70">
                You are not enrolled in any courses yet. Contact your instructor
                or administrator to get enrolled in courses.
              </p>
              <div className="mt-4">
                <p className="text-xs text-primary-500">
                  Once you&apos;re enrolled, you&apos;ll see your course
                  progress, grades, and personalized study tips here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!showCourseDetails) {
    // Course Overview Dashboard
    const overallStats = {
      totalCourses: courses.length,
      averageCompletion: Math.round(
        courses.reduce((acc, c) => acc + c.completionPercentage, 0) /
          courses.length
      ),
      averageGrade: Math.round(
        courses.reduce((acc, c) => acc + c.averageGrade, 0) / courses.length
      ),
      totalAssignments: courses.reduce((acc, c) => acc + c.totalAssignments, 0),
      submittedAssignments: courses.reduce(
        (acc, c) => acc + c.submittedAssignments,
        0
      ),
    };

    const gradeDistribution = courses.map((course) => ({
      name: course.courseCode,
      grade: course.averageGrade,
      completion: course.completionPercentage,
      fill:
        course.averageGrade >= 80
          ? "var(--color-chart-1)"
          : course.averageGrade >= 60
          ? "var(--color-chart-4)"
          : "var(--color-chart-5)",
    }));

    return (
      <main className="min-h-screen bg-primary-50 p-3 sm:p-6">
        <div className="max-w-6xl w-full mx-auto">
          <div className="space-y-4 sm:space-y-6">
            {/* Responsive Header */}
            <Card className="bg-white border-primary-200 shadow-sm rounded-lg">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex flex-col gap-4 sm:flex-row justify-between items-start sm:items-center sm:gap-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-primary-100 rounded-xl">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-primary-800">
                        My Progress Dashboard
                      </h1>
                      <p className="text-primary-600/70 text-sm sm:text-base">
                        Overview of your academic performance
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto">
                    <Select
                      value={selectedCourse}
                      onValueChange={setSelectedCourse}
                    >
                      <SelectTrigger className="w-full sm:w-72 bg-white border-primary-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg">
                        <SelectValue placeholder="View course details" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg border-primary-200 max-w-[90vw] sm:max-w-none">
                        {courses.map((course) => (
                          <SelectItem
                            key={course.courseId}
                            value={course.courseId}
                            className="break-words"
                          >
                            <div className="flex flex-row items-center gap-1 py-1">
                              <span className="font-medium break-words">
                                {course.courseName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({course.courseCode})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Responsive Overall Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-white border-primary-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-primary-700">
                    Enrolled Courses
                  </CardTitle>
                  <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-primary-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-primary-800">
                    {overallStats.totalCourses}
                  </div>
                  <p className="text-primary-600/70 text-xs mt-1">
                    Active enrollments
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white border-success-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-success-700">
                    Avg Completion
                  </CardTitle>
                  <div className="p-1.5 sm:p-2 bg-success-100 rounded-lg">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 text-success-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-success-800">
                    {overallStats.averageCompletion}%
                  </div>
                  <p className="text-success-600/70 text-xs mt-1">
                    Course progress
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white border-info-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-info-700">
                    Avg Grade
                  </CardTitle>
                  <div className="p-1.5 sm:p-2 bg-info-100 rounded-lg">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-info-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-info-800">
                    {overallStats.averageGrade}%
                  </div>
                  <p className="text-info-600/70 text-xs mt-1">
                    Overall performance
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white border-warning-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-warning-700">
                    Assignments
                  </CardTitle>
                  <div className="p-1.5 sm:p-2 bg-warning-100 rounded-lg">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-warning-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-warning-800">
                    {overallStats.submittedAssignments}/
                    {overallStats.totalAssignments}
                  </div>
                  <p className="text-warning-600/70 text-xs mt-1">Submitted</p>
                </CardContent>
              </Card>
            </div>

            {/* Responsive Course Performance Chart */}
            <Card className="bg-white border-primary-200 shadow-sm rounded-lg">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 sm:p-2 bg-info-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-info-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-semibold text-primary-800">
                      Course Performance Overview
                    </CardTitle>
                    <CardDescription className="text-primary-600/70 text-xs sm:text-sm">
                      Your average grades across all enrolled courses
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[400px]">
                    <ChartContainer
                      config={chartConfig}
                      className="h-[300px] sm:h-[400px] w-full"
                    >
                      <BarChart
                        data={gradeDistribution}
                        margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={10}
                          stroke="#64748b"
                        />
                        <YAxis
                          label={{
                            value: "Grade %",
                            angle: -90,
                            position: "insideLeft",
                          }}
                          stroke="#64748b"
                          fontSize={11}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="grade"
                          fill="var(--color-chart-1)"
                          name="Average Grade %"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Responsive Course Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {courses.map((course) => (
                <Card
                  key={course.courseId}
                  className="bg-white border-primary-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer rounded-lg"
                  onClick={() => setSelectedCourse(course.courseId)}
                >
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg flex-shrink-0">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg font-semibold text-primary-800 break-words leading-tight">
                          {course.courseName}
                        </CardTitle>
                        <CardDescription className="text-primary-600/70 text-xs sm:text-sm break-words">
                          {course.courseCode}
                        </CardDescription>
                        <p className="text-xs text-primary-600/60 mt-1 break-words line-clamp-2">
                          {course.shortDescription}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-medium text-primary-700">
                        Average Grade
                      </span>
                      <span
                        className={`font-bold text-xs sm:text-sm px-2 py-1 rounded-lg ${
                          course.averageGrade >= 80
                            ? "bg-success-100 text-success-700"
                            : course.averageGrade >= 60
                            ? "bg-warning-100 text-warning-700"
                            : "bg-danger-100 text-danger-700"
                        }`}
                      >
                        {course.averageGrade}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-medium text-primary-700">
                        Completion
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-primary-800">
                        {course.completionPercentage}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-primary-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${course.completionPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-primary-600/70">
                        <span>
                          {course.submittedAssignments}/
                          {course.totalAssignments} assignments
                        </span>
                        <span>{course.gradedAssignments} graded</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Course-Specific Details View
  return (
    <main className="min-h-screen bg-primary-50 p-3 sm:p-6">
      <div className="max-w-6xl w-full mx-auto">
        <div className="space-y-4 sm:space-y-6">
          {/* Responsive Header */}
          <Card className="bg-white border-primary-200 shadow-sm rounded-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col gap-4 justify-between items-start sm:gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCourseDetails(false);
                      setSelectedCourse("");
                      setImprovementTips("");
                    }}
                    className="border-primary-200 text-primary-700 hover:bg-primary-50 text-sm sm:text-base"
                  >
                    ← Back to Overview
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                    </div>
                    <div>
                      <h1 className="text-lg sm:text-xl font-bold text-primary-800">
                        {courseDetails?.courseName}
                      </h1>
                      <p className="text-primary-600/70 text-xs sm:text-sm">
                        {courseDetails?.courseCode}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <Select
                    value={selectedCourse}
                    onValueChange={setSelectedCourse}
                  >
                    <SelectTrigger className="w-full bg-white border-primary-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg">
                      <SelectValue placeholder="Switch course" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-primary-200 max-w-[90vw] sm:max-w-none">
                      {courses.map((course) => (
                        <SelectItem
                          key={course.courseId}
                          value={course.courseId}
                          className="break-words"
                        >
                          <div className="flex flex-row items-center gap-1 py-1">
                            <span className="font-medium">
                              {course.courseName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({course.courseCode})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Responsive Course Stats */}
          {courseDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-white border-success-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-success-700">
                    Course Progress
                  </CardTitle>
                  <div className="p-1.5 sm:p-2 bg-success-100 rounded-lg">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 text-success-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-success-800">
                    {courseDetails.completionPercentage}%
                  </div>
                  <p className="text-success-600/70 text-xs mt-1">Completed</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-info-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-info-700">
                    Average Grade
                  </CardTitle>
                  <div className="p-1.5 sm:p-2 bg-info-100 rounded-lg">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-info-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-info-800">
                    {courseDetails.averageGrade}%
                  </div>
                  <p className="text-info-600/70 text-xs mt-1">Performance</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-warning-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-warning-700">
                    Submitted
                  </CardTitle>
                  <div className="p-1.5 sm:p-2 bg-warning-100 rounded-lg">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-warning-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-warning-800">
                    {courseDetails.submittedAssignments}/
                    {courseDetails.totalAssignments}
                  </div>
                  <p className="text-warning-600/70 text-xs mt-1">
                    Assignments
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white border-primary-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-primary-700">
                    Graded
                  </CardTitle>
                  <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-primary-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-primary-800">
                    {courseDetails.gradedAssignments}/
                    {courseDetails.totalAssignments}
                  </div>
                  <p className="text-primary-600/70 text-xs mt-1">Evaluated</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Responsive Assignment Breakdown */}
          <Card className="bg-white border-primary-200 shadow-sm rounded-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 sm:p-2 bg-success-100 rounded-lg">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-success-600" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-primary-800">
                    Assignment Breakdown
                  </CardTitle>
                  <CardDescription className="text-primary-600/70 text-xs sm:text-sm">
                    Detailed view of your performance on each assignment
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {assignments.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="p-3 sm:p-4 bg-primary-100 rounded-xl inline-block mb-4">
                    <BookOpen className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-primary-600" />
                  </div>
                  <h3 className="mt-2 text-base sm:text-lg font-bold text-primary-800">
                    No assignments yet
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-primary-600/70">
                    Your instructor hasn&apos;t created any assignments for this
                    course yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="hidden sm:grid grid-cols-12 gap-2 sm:gap-4 text-xs font-semibold text-gray-600 pb-2 border-b">
                    <div className="col-span-4">Assignment</div>
                    <div className="col-span-3">Topics</div>
                    <div className="col-span-2">Grade</div>
                    <div className="col-span-2">Due Date</div>
                    <div className="col-span-1">Status</div>
                  </div>
                  <div className="grid gap-3 sm:gap-4">
                    {assignments.map((assignment, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-2 items-start sm:items-center p-3 sm:p-4 border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        {/* Assignment Name - Mobile: full width, Desktop: 4 columns */}
                        <div className="w-full sm:col-span-4">
                          <div className="font-medium text-sm sm:text-base leading-tight break-words">
                            {assignment.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 leading-tight break-words">
                            {assignment.description}
                          </div>
                        </div>

                        {/* Topics - Mobile: full width, Desktop: 3 columns */}
                        <div className="w-full sm:col-span-3">
                          <div className="flex flex-wrap gap-1">
                            {assignment.topics.slice(0, 2).map((topic, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {topic}
                              </span>
                            ))}
                            {assignment.topics.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                +{assignment.topics.length - 2}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Grade Cell - Mobile: full width, Desktop: 2 columns */}
                        <div className="w-full sm:col-span-2">
                          <div className="flex items-center gap-2 sm:block">
                            <span className="text-xs font-semibold text-gray-600 sm:hidden">
                              Grade:
                            </span>
                            <div
                              className={`
                          w-full sm:w-full h-12 sm:h-16 rounded-lg flex flex-col items-center justify-center text-white font-bold text-sm
                          ${
                            assignment.grade !== null
                              ? assignment.grade >= 90
                                ? "bg-green-500"
                                : assignment.grade >= 80
                                ? "bg-green-400"
                                : assignment.grade >= 70
                                ? "bg-yellow-500"
                                : assignment.grade >= 60
                                ? "bg-orange-500"
                                : "bg-red-500"
                              : assignment.status === "overdue"
                              ? "bg-red-400"
                              : "bg-gray-300 text-gray-600"
                          }
                        `}
                            >
                              {assignment.grade !== null ? (
                                <>
                                  <span className="text-base sm:text-lg">
                                    {assignment.grade}%
                                  </span>
                                  <span className="text-xs opacity-80">
                                    {assignment.grade}/{assignment.totalPoints}
                                  </span>
                                </>
                              ) : assignment.status === "overdue" ? (
                                <>
                                  <span className="text-xs">OVERDUE</span>
                                  <span className="text-xs opacity-80">0%</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-xs">PENDING</span>
                                  <span className="text-xs opacity-80">-</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Due Date - Mobile: full width, Desktop: 2 columns */}
                        <div className="w-full sm:col-span-2">
                          <div className="flex items-center gap-2 sm:block">
                            <span className="text-xs font-semibold text-gray-600 sm:hidden">
                              Due:
                            </span>
                            <div className="text-sm">
                              <div className="text-gray-600">
                                {assignment.dueDate ? (
                                  <>
                                    <div className="font-medium">
                                      {new Date(
                                        assignment.dueDate
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(
                                        assignment.dueDate
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                      })}
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-gray-400 text-xs">
                                    No due date
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status - Mobile: full width, Desktop: 1 column */}
                        <div className="w-full sm:col-span-1">
                          <div className="flex items-center gap-2 sm:justify-center">
                            <span className="text-xs font-semibold text-gray-600 sm:hidden">
                              Status:
                            </span>
                            <div
                              className={`
                          w-3 h-3 sm:w-4 sm:h-4 rounded-full
                          ${
                            assignment.status === "submitted"
                              ? "bg-green-500"
                              : assignment.status === "late"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }
                        `}
                              title={
                                assignment.status === "submitted"
                                  ? "Submitted On Time"
                                  : assignment.status === "late"
                                  ? "Submitted Late"
                                  : "Overdue"
                              }
                            ></div>
                            <span className="text-xs text-gray-600 sm:hidden">
                              {assignment.status === "submitted"
                                ? "On Time"
                                : assignment.status === "late"
                                ? "Late"
                                : "Overdue"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Responsive Legend */}
                  <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-gray-600 font-medium">
                        Grade Colors:
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
                      <span>90-100%</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded"></div>
                      <span>80-89%</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded"></div>
                      <span>70-79%</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 rounded"></div>
                      <span>60-69%</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded"></div>
                      <span>Below 60%</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded"></div>
                      <span>Not Graded</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Responsive AI Improvement Tips */}
          <Card className="bg-white border-primary-200 shadow-sm rounded-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col gap-3 sm:flex-row items-start sm:items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 sm:p-2 bg-warning-100 rounded-lg">
                    <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-warning-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-semibold text-primary-800">
                      AI-Powered Improvement Tips
                    </CardTitle>
                    <CardDescription className="text-primary-600/70 text-xs sm:text-sm">
                      Personalized recommendations based on your performance
                      data
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={generateImprovementTips}
                  disabled={tipsLoading}
                  variant="outline"
                  size="sm"
                  className="border-primary-200 text-primary-700 hover:bg-primary-50 w-full sm:w-auto"
                >
                  <RefreshCw
                    className={`w-3 h-3 sm:w-4 sm:h-4 mr-2 ${
                      tipsLoading ? "animate-spin" : ""
                    }`}
                  />
                  {tipsLoading ? "Generating..." : "Refresh Tips"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {tipsLoading ? (
                <div className="flex flex-col sm:flex-row items-center justify-center py-12 sm:py-16 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-primary-100 rounded-xl">
                    <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary-600" />
                  </div>
                  <span className="text-primary-700 font-medium text-sm sm:text-base text-center sm:text-left">
                    AI is analyzing your performance...
                  </span>
                </div>
              ) : improvementTips ? (
                <div className="prose prose-sm max-w-none">
                  <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
                    <MyMarkdown>{improvementTips}</MyMarkdown>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="p-4 bg-warning-100 rounded-xl inline-block mb-4">
                    <Lightbulb className="w-8 h-8 text-warning-600" />
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-primary-800">
                    Get Personalized Tips
                  </h3>
                  <p className="mt-1 text-sm text-primary-600/70">
                    Click &ldquo;Refresh Tips&rdquo; to get personalized
                    improvement recommendations
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
