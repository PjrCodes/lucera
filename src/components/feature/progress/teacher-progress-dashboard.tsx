"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell
} from "recharts";
import { Download, Users, BookOpen, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimpleCourse {
  _id: string;
  name: string;
  code: string;
  description: string;
}

interface TeacherProgressDashboardProps {
  userId: string;
}

interface CourseProgress {
  studentName: string;
  completion: number;
  submissions: number;
  averageGrade: number;
  fill?: string;
}

interface AssignmentAnalytics {
  assignmentTitle: string;
  averageGrade: number;
  submissionCount: number;
  onTimeCount: number;
  lateCount: number;
  notSubmittedCount: number;
  gradeDistribution: { range: string; count: number; fill?: string }[];
}

interface StudentPerformance {
  studentId: string;
  studentName: string;
  courseCompletion: number;
  assignments: {
    title: string;
    grade: number | null;
    submissionDate: string | null;
    dueDate: string;
    status: 'submitted' | 'late' | 'missing';
  }[];
}

const chartConfig = {
  completion: {
    label: "Completion %",
    color: "var(--color-chart-1)",
  },
  submissions: {
    label: "Submissions",
    color: "var(--color-chart-2)",
  },
  grade: {
    label: "Grade",
    color: "var(--color-chart-3)",
  },
  onTime: {
    label: "On Time",
    color: "var(--color-chart-1)",
  },
  late: {
    label: "Late",
    color: "var(--color-chart-4)",
  },
  missing: {
    label: "Missing",
    color: "var(--color-chart-5)",
  },
  students: {
    label: "Students",
    color: "var(--color-chart-1)",
  },
  averageGrade: {
    label: "Average Grade",
    color: "var(--color-chart-2)",
  },
  submissionCount: {
    label: "Submissions",
    color: "var(--color-chart-3)",
  },
  excellent: {
    label: "Excellent (90-100%)",
    color: "var(--color-chart-1)",
  },
  good: {
    label: "Good (80-89%)",
    color: "var(--color-chart-2)",
  },
  satisfactory: {
    label: "Satisfactory (70-79%)",
    color: "var(--color-chart-3)",
  },
  needsImprovement: {
    label: "Needs Improvement (60-69%)",
    color: "var(--color-chart-4)",
  },
  unsatisfactory: {
    label: "Unsatisfactory (<60%)",
    color: "var(--color-chart-5)",
  },
};

export default function TeacherProgressDashboard({ userId }: TeacherProgressDashboardProps) {
  const [courses, setCourses] = useState<SimpleCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [assignmentAnalytics, setAssignmentAnalytics] = useState<AssignmentAnalytics[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);

  // Fetch teacher's courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Demo courses data
        const demoCourses = [
          {
            _id: "1",
            name: "Algorithm Design & Analysis",
            code: "CS301",
            description: "Advanced algorithms and computational complexity"
          },
          {
            _id: "2",
            name: "Data Science Fundamentals",
            code: "DS201",
            description: "Statistics, visualization, and machine learning basics"
          },
          {
            _id: "3",
            name: "Machine Learning Applications",
            code: "ML401",
            description: "Practical ML techniques and real-world applications"
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setCourses(demoCourses);
        if (demoCourses.length > 0) {
          setSelectedCourse(demoCourses[0]._id.toString());
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);

  // Fetch course progress data
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchCourseProgress = async () => {
      try {
        // Demo course progress data with rich variation
        const demoProgressData: Record<string, CourseProgress[]> = {
          "1": [ // Algorithm Design
            { studentName: "Alice Johnson", completion: 92, submissions: 10, averageGrade: 87.5 },
            { studentName: "Bob Smith", completion: 75, submissions: 9, averageGrade: 81.2 },
            { studentName: "Carol Davis", completion: 98, submissions: 11, averageGrade: 91.8 },
            { studentName: "David Wilson", completion: 68, submissions: 8, averageGrade: 76.4 },
            { studentName: "Eva Brown", completion: 85, submissions: 10, averageGrade: 83.6 },
            { studentName: "Frank Miller", completion: 72, submissions: 8, averageGrade: 78.9 },
            { studentName: "Grace Lee", completion: 89, submissions: 10, averageGrade: 85.3 },
            { studentName: "Henry Chen", completion: 81, submissions: 9, averageGrade: 82.1 },
            { studentName: "Ivy Taylor", completion: 94, submissions: 11, averageGrade: 89.7 },
            { studentName: "Jack Anderson", completion: 77, submissions: 9, averageGrade: 79.5 }
          ],
          "2": [ // Data Science
            { studentName: "Katie Robinson", completion: 88, submissions: 7, averageGrade: 86.2 },
            { studentName: "Liam Garcia", completion: 92, submissions: 8, averageGrade: 91.5 },
            { studentName: "Mia Martinez", completion: 76, submissions: 6, averageGrade: 78.8 },
            { studentName: "Noah Thompson", completion: 84, submissions: 7, averageGrade: 82.4 },
            { studentName: "Olivia White", completion: 96, submissions: 8, averageGrade: 93.1 },
            { studentName: "Parker Lewis", completion: 71, submissions: 6, averageGrade: 75.6 },
            { studentName: "Quinn Hall", completion: 87, submissions: 7, averageGrade: 84.9 },
            { studentName: "Ruby Clark", completion: 79, submissions: 6, averageGrade: 80.3 }
          ],
          "3": [ // Machine Learning
            { studentName: "Sam Rodriguez", completion: 85, submissions: 5, averageGrade: 87.2 },
            { studentName: "Tina Walker", completion: 91, submissions: 6, averageGrade: 89.8 },
            { studentName: "Uma Patel", completion: 78, submissions: 5, averageGrade: 81.5 },
            { studentName: "Victor Kim", completion: 93, submissions: 6, averageGrade: 92.3 },
            { studentName: "Wendy Scott", completion: 82, submissions: 5, averageGrade: 84.7 },
            { studentName: "Xavier Green", completion: 88, submissions: 6, averageGrade: 86.9 }
          ]
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 400));
        const progressData = demoProgressData[selectedCourse] || [];
        // Add fill colors based on completion percentage
        const progressDataWithColors = progressData.map(student => ({
          ...student,
          fill: student.completion >= 90 ? "var(--color-chart-1)" :
                student.completion >= 80 ? "var(--color-chart-2)" :
                student.completion >= 70 ? "var(--color-chart-3)" :
                student.completion >= 60 ? "var(--color-chart-4)" : "var(--color-chart-5)"
        }));

        setCourseProgress(progressDataWithColors);
      } catch (error) {
        console.error('Error fetching course progress:', error);
      }
    };

    fetchCourseProgress();
  }, [selectedCourse]);

  // Fetch assignment analytics
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchAssignmentAnalytics = async () => {
      try {
        // Demo assignment analytics with rich color data
        const demoAnalyticsData: Record<string, AssignmentAnalytics[]> = {
          "1": [ // Algorithm Design
            {
              assignmentTitle: "Algorithm Fundamentals",
              averageGrade: 87.5,
              submissionCount: 10,
              onTimeCount: 9,
              lateCount: 1,
              notSubmittedCount: 0,
              gradeDistribution: [
                { range: "90-100%", count: 4, fill: "var(--color-excellent)" },
                { range: "80-89%", count: 3, fill: "var(--color-good)" },
                { range: "70-79%", count: 2, fill: "var(--color-satisfactory)" },
                { range: "60-69%", count: 1, fill: "var(--color-needsImprovement)" },
                { range: "<60%", count: 0, fill: "var(--color-unsatisfactory)" }
              ]
            },
            {
              assignmentTitle: "Data Structures Implementation",
              averageGrade: 82.3,
              submissionCount: 9,
              onTimeCount: 8,
              lateCount: 1,
              notSubmittedCount: 1,
              gradeDistribution: [
                { range: "90-100%", count: 2, fill: "var(--color-excellent)" },
                { range: "80-89%", count: 4, fill: "var(--color-good)" },
                { range: "70-79%", count: 2, fill: "var(--color-satisfactory)" },
                { range: "60-69%", count: 1, fill: "var(--color-needsImprovement)" },
                { range: "<60%", count: 0, fill: "var(--color-unsatisfactory)" }
              ]
            },
            {
              assignmentTitle: "Sorting and Searching",
              averageGrade: 85.1,
              submissionCount: 10,
              onTimeCount: 10,
              lateCount: 0,
              notSubmittedCount: 0,
              gradeDistribution: [
                { range: "90-100%", count: 3, fill: "var(--color-excellent)" },
                { range: "80-89%", count: 5, fill: "var(--color-good)" },
                { range: "70-79%", count: 1, fill: "var(--color-satisfactory)" },
                { range: "60-69%", count: 1, fill: "var(--color-needsImprovement)" },
                { range: "<60%", count: 0, fill: "var(--color-unsatisfactory)" }
              ]
            },
            {
              assignmentTitle: "Graph Theory Basics",
              averageGrade: 88.7,
              submissionCount: 10,
              onTimeCount: 9,
              lateCount: 1,
              notSubmittedCount: 0,
              gradeDistribution: [
                { range: "90-100%", count: 5, fill: "var(--color-excellent)" },
                { range: "80-89%", count: 3, fill: "var(--color-good)" },
                { range: "70-79%", count: 2, fill: "var(--color-satisfactory)" },
                { range: "60-69%", count: 0, fill: "var(--color-needsImprovement)" },
                { range: "<60%", count: 0, fill: "var(--color-unsatisfactory)" }
              ]
            }
          ],
          "2": [ // Data Science
            {
              assignmentTitle: "Python Fundamentals",
              averageGrade: 89.2,
              submissionCount: 8,
              onTimeCount: 7,
              lateCount: 1,
              notSubmittedCount: 0,
              gradeDistribution: [
                { range: "90-100%", count: 4, fill: "var(--color-excellent)" },
                { range: "80-89%", count: 2, fill: "var(--color-good)" },
                { range: "70-79%", count: 2, fill: "var(--color-satisfactory)" },
                { range: "60-69%", count: 0, fill: "var(--color-needsImprovement)" },
                { range: "<60%", count: 0, fill: "var(--color-unsatisfactory)" }
              ]
            },
            {
              assignmentTitle: "Data Visualization",
              averageGrade: 84.6,
              submissionCount: 7,
              onTimeCount: 6,
              lateCount: 1,
              notSubmittedCount: 1,
              gradeDistribution: [
                { range: "90-100%", count: 3, fill: "var(--color-excellent)" },
                { range: "80-89%", count: 2, fill: "var(--color-good)" },
                { range: "70-79%", count: 2, fill: "var(--color-satisfactory)" },
                { range: "60-69%", count: 0, fill: "var(--color-needsImprovement)" },
                { range: "<60%", count: 0, fill: "var(--color-unsatisfactory)" }
              ]
            },
            {
              assignmentTitle: "Statistical Analysis",
              averageGrade: 86.8,
              submissionCount: 8,
              onTimeCount: 8,
              lateCount: 0,
              notSubmittedCount: 0,
              gradeDistribution: [
                { range: "90-100%", count: 3, fill: "var(--color-excellent)" },
                { range: "80-89%", count: 4, fill: "var(--color-good)" },
                { range: "70-79%", count: 1, fill: "var(--color-satisfactory)" },
                { range: "60-69%", count: 0, fill: "var(--color-needsImprovement)" },
                { range: "<60%", count: 0, fill: "var(--color-unsatisfactory)" }
              ]
            }
          ],
          "3": [ // Machine Learning
            {
              assignmentTitle: "Linear Regression",
              averageGrade: 88.1,
              submissionCount: 6,
              onTimeCount: 5,
              lateCount: 1,
              notSubmittedCount: 0,
              gradeDistribution: [
                { range: "90-100%", count: 2, fill: "var(--color-excellent)" },
                { range: "80-89%", count: 3, fill: "var(--color-good)" },
                { range: "70-79%", count: 1, fill: "var(--color-satisfactory)" },
                { range: "60-69%", count: 0, fill: "var(--color-needsImprovement)" },
                { range: "<60%", count: 0, fill: "var(--color-unsatisfactory)" }
              ]
            },
            {
              assignmentTitle: "Neural Networks",
              averageGrade: 85.4,
              submissionCount: 5,
              onTimeCount: 4,
              lateCount: 1,
              notSubmittedCount: 1,
              gradeDistribution: [
                { range: "90-100%", count: 2, fill: "var(--color-excellent)" },
                { range: "80-89%", count: 2, fill: "var(--color-good)" },
                { range: "70-79%", count: 1, fill: "var(--color-satisfactory)" },
                { range: "60-69%", count: 0, fill: "var(--color-needsImprovement)" },
                { range: "<60%", count: 0, fill: "var(--color-unsatisfactory)" }
              ]
            }
          ]
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        const analyticsData = demoAnalyticsData[selectedCourse] || [];
        setAssignmentAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching assignment analytics:', error);
      }
    };

    fetchAssignmentAnalytics();
  }, [selectedCourse]);

  // Fetch students for student view
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchStudents = async () => {
      try {
        // Demo students data based on selected course
        const demoStudents: Record<string, { id: string; name: string }[]> = {
          "1": [
            { id: "s1", name: "Alice Johnson" },
            { id: "s2", name: "Bob Smith" },
            { id: "s3", name: "Carol Davis" },
            { id: "s4", name: "David Wilson" },
            { id: "s5", name: "Eva Brown" },
            { id: "s6", name: "Frank Miller" },
            { id: "s7", name: "Grace Lee" },
            { id: "s8", name: "Henry Chen" },
            { id: "s9", name: "Ivy Taylor" },
            { id: "s10", name: "Jack Anderson" }
          ],
          "2": [
            { id: "s11", name: "Katie Robinson" },
            { id: "s12", name: "Liam Garcia" },
            { id: "s13", name: "Mia Martinez" },
            { id: "s14", name: "Noah Thompson" },
            { id: "s15", name: "Olivia White" },
            { id: "s16", name: "Parker Lewis" },
            { id: "s17", name: "Quinn Hall" },
            { id: "s18", name: "Ruby Clark" }
          ],
          "3": [
            { id: "s19", name: "Sam Rodriguez" },
            { id: "s20", name: "Tina Walker" },
            { id: "s21", name: "Uma Patel" },
            { id: "s22", name: "Victor Kim" },
            { id: "s23", name: "Wendy Scott" },
            { id: "s24", name: "Xavier Green" }
          ]
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        const studentList = demoStudents[selectedCourse] || [];
        setStudents(studentList);
        if (studentList.length > 0) {
          setSelectedStudent(studentList[0].id);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, [selectedCourse]);

  // Fetch individual student performance
  useEffect(() => {
    if (!selectedStudent || !selectedCourse) return;

    const fetchStudentPerformance = async () => {
      try {
        // Demo student performance data
        const performanceData: Record<string, StudentPerformance> = {
          "s1": { // Alice Johnson - High Performer
            studentId: "s1",
            studentName: "Alice Johnson",
            courseCompletion: 85,
            assignments: [
              { title: "Algorithm Fundamentals", grade: 92, submissionDate: "2024-01-15", dueDate: "2024-01-16", status: "submitted" },
              { title: "Data Structures Implementation", grade: 88, submissionDate: "2024-01-22", dueDate: "2024-01-23", status: "submitted" },
              { title: "Sorting and Searching", grade: 85, submissionDate: "2024-01-29", dueDate: "2024-01-30", status: "submitted" },
              { title: "Graph Theory Basics", grade: 90, submissionDate: "2024-02-05", dueDate: "2024-02-06", status: "submitted" },
              { title: "Dynamic Programming", grade: 82, submissionDate: "2024-02-12", dueDate: "2024-02-13", status: "submitted" },
              { title: "Greedy Algorithms", grade: 89, submissionDate: "2024-02-19", dueDate: "2024-02-20", status: "submitted" },
              { title: "Tree Traversal Methods", grade: 94, submissionDate: "2024-02-26", dueDate: "2024-02-27", status: "submitted" },
              { title: "Hash Tables and Maps", grade: 86, submissionDate: "2024-03-05", dueDate: "2024-03-06", status: "submitted" },
              { title: "Advanced Sorting", grade: 91, submissionDate: "2024-03-12", dueDate: "2024-03-13", status: "submitted" },
              { title: "Binary Search Trees", grade: 87, submissionDate: "2024-03-19", dueDate: "2024-03-20", status: "submitted" },
              { title: "Final Project Proposal", grade: null, submissionDate: null, dueDate: "2024-04-01", status: "missing" },
              { title: "Comprehensive Exam", grade: null, submissionDate: null, dueDate: "2024-04-15", status: "missing" }
            ]
          },
          "s2": { // Bob Smith - Average Performer
            studentId: "s2",
            studentName: "Bob Smith",
            courseCompletion: 75,
            assignments: [
              { title: "Algorithm Fundamentals", grade: 85, submissionDate: "2024-01-16", dueDate: "2024-01-16", status: "submitted" },
              { title: "Data Structures Implementation", grade: 79, submissionDate: "2024-01-23", dueDate: "2024-01-23", status: "submitted" },
              { title: "Sorting and Searching", grade: 82, submissionDate: "2024-01-30", dueDate: "2024-01-30", status: "submitted" },
              { title: "Graph Theory Basics", grade: 77, submissionDate: "2024-02-07", dueDate: "2024-02-06", status: "late" },
              { title: "Dynamic Programming", grade: 84, submissionDate: "2024-02-13", dueDate: "2024-02-13", status: "submitted" },
              { title: "Greedy Algorithms", grade: 80, submissionDate: "2024-02-20", dueDate: "2024-02-20", status: "submitted" },
              { title: "Tree Traversal Methods", grade: 86, submissionDate: "2024-02-27", dueDate: "2024-02-27", status: "submitted" },
              { title: "Hash Tables and Maps", grade: 78, submissionDate: "2024-03-08", dueDate: "2024-03-06", status: "late" },
              { title: "Advanced Sorting", grade: 88, submissionDate: "2024-03-13", dueDate: "2024-03-13", status: "submitted" },
              { title: "Binary Search Trees", grade: null, submissionDate: null, dueDate: "2024-03-20", status: "missing" },
              { title: "Final Project Proposal", grade: null, submissionDate: null, dueDate: "2024-04-01", status: "missing" },
              { title: "Comprehensive Exam", grade: null, submissionDate: null, dueDate: "2024-04-15", status: "missing" }
            ]
          },
          "s3": { // Carol Davis - Top Performer
            studentId: "s3",
            studentName: "Carol Davis",
            courseCompletion: 92,
            assignments: [
              { title: "Algorithm Fundamentals", grade: 95, submissionDate: "2024-01-14", dueDate: "2024-01-16", status: "submitted" },
              { title: "Data Structures Implementation", grade: 93, submissionDate: "2024-01-21", dueDate: "2024-01-23", status: "submitted" },
              { title: "Sorting and Searching", grade: 89, submissionDate: "2024-01-28", dueDate: "2024-01-30", status: "submitted" },
              { title: "Graph Theory Basics", grade: 94, submissionDate: "2024-02-04", dueDate: "2024-02-06", status: "submitted" },
              { title: "Dynamic Programming", grade: 90, submissionDate: "2024-02-11", dueDate: "2024-02-13", status: "submitted" },
              { title: "Greedy Algorithms", grade: 92, submissionDate: "2024-02-18", dueDate: "2024-02-20", status: "submitted" },
              { title: "Tree Traversal Methods", grade: 96, submissionDate: "2024-02-25", dueDate: "2024-02-27", status: "submitted" },
              { title: "Hash Tables and Maps", grade: 88, submissionDate: "2024-03-04", dueDate: "2024-03-06", status: "submitted" },
              { title: "Advanced Sorting", grade: 93, submissionDate: "2024-03-11", dueDate: "2024-03-13", status: "submitted" },
              { title: "Binary Search Trees", grade: 91, submissionDate: "2024-03-18", dueDate: "2024-03-20", status: "submitted" },
              { title: "Final Project Proposal", grade: 89, submissionDate: "2024-03-25", dueDate: "2024-04-01", status: "submitted" },
              { title: "Comprehensive Exam", grade: null, submissionDate: null, dueDate: "2024-04-15", status: "missing" }
            ]
          }
        };

        // Add default data for other students with varied performance patterns
        const defaultStudentData: StudentPerformance = {
          studentId: selectedStudent,
          studentName: students.find(s => s.id === selectedStudent)?.name || "Unknown Student",
          courseCompletion: 75,
          assignments: [
            { title: "Algorithm Fundamentals", grade: 80, submissionDate: "2024-01-15", dueDate: "2024-01-16", status: "submitted" },
            { title: "Data Structures Implementation", grade: 75, submissionDate: "2024-01-22", dueDate: "2024-01-23", status: "submitted" },
            { title: "Sorting and Searching", grade: 85, submissionDate: "2024-01-29", dueDate: "2024-01-30", status: "submitted" },
            { title: "Graph Theory Basics", grade: 78, submissionDate: "2024-02-07", dueDate: "2024-02-06", status: "late" },
            { title: "Dynamic Programming", grade: 82, submissionDate: "2024-02-12", dueDate: "2024-02-13", status: "submitted" },
            { title: "Greedy Algorithms", grade: 79, submissionDate: "2024-02-19", dueDate: "2024-02-20", status: "submitted" },
            { title: "Tree Traversal Methods", grade: 88, submissionDate: "2024-02-26", dueDate: "2024-02-27", status: "submitted" },
            { title: "Hash Tables and Maps", grade: 83, submissionDate: "2024-03-05", dueDate: "2024-03-06", status: "submitted" },
            { title: "Advanced Sorting", grade: null, submissionDate: null, dueDate: "2024-03-13", status: "missing" },
            { title: "Binary Search Trees", grade: null, submissionDate: null, dueDate: "2024-03-20", status: "missing" },
            { title: "Final Project Proposal", grade: null, submissionDate: null, dueDate: "2024-04-01", status: "missing" },
            { title: "Comprehensive Exam", grade: null, submissionDate: null, dueDate: "2024-04-15", status: "missing" }
          ]
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));
        const studentData = performanceData[selectedStudent] || defaultStudentData;
        setStudentPerformance(studentData);
      } catch (error) {
        console.error('Error fetching student performance:', error);
      }
    };

    fetchStudentPerformance();
  }, [selectedStudent, selectedCourse, students]);

  const exportToCSV = () => {
    // Dummy CSV export functionality
    if (courseProgress.length === 0) {
      alert('No data to export');
      return;
    }

    const csvContent = [
      ['Student Name', 'Completion %', 'Submissions', 'Average Grade'],
      ...courseProgress.map(student => [
        student.studentName,
        student.completion.toString(),
        student.submissions.toString(),
        student.averageGrade.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course-progress.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-primary-200 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-primary-200 rounded-xl w-1/3 mb-4"></div>
              <div className="h-4 bg-primary-100 rounded-lg w-1/2"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-primary-200 p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-primary-200 rounded-lg w-3/4 mb-4"></div>
                  <div className="h-8 bg-primary-100 rounded-xl w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-primary-200 p-16 text-center">
            <div className="p-4 bg-primary-100 rounded-xl inline-block mb-6">
              <BookOpen className="mx-auto h-16 w-16 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-primary-800 mb-2">No courses found</h3>
            <p className="text-primary-600/80">Create your first course to see analytics.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Simplified Header */}
        <div className="flex flex-col gap-4 bg-white rounded-xl shadow-sm border border-primary-200 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary-800">Teacher Analytics</h1>
              <p className="text-primary-600/80 text-xs sm:text-sm">Track student performance and course progress</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full sm:w-72 bg-white border-primary-200 hover:border-primary-300 transition-colors rounded-lg">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-primary-200">
                {courses.map((course) => (
                  <SelectItem key={course._id.toString()} value={course._id.toString()}>
                    {course.name} ({course.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white shadow-sm rounded-lg w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              <span className="sm:inline">Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="flex flex-col sm:flex-row flex-wrap gap-1 w-full bg-primary-100 border border-primary-200 rounded-lg p-1 min-h-fit text-center">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-900 text-primary-700 whitespace-nowrap flex items-center justify-center px-3 py-2 w-full sm:w-auto text-center"
            >
              <div className="flex items-center justify-center w-full">
              <TrendingUp className="mr-2 w-4 h-4" />
              <span className="text-sm">Course Overview</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-success-50 data-[state=active]:text-success-900 text-success-700 whitespace-nowrap flex items-center justify-center px-3 py-2 w-full sm:w-auto text-center"
            >
              <div className="flex items-center justify-center w-full">
              <BookOpen className="mr-2 w-4 h-4" />
              <span className="text-sm">Assignment Analytics</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="student"
              className="data-[state=active]:bg-info-50 data-[state=active]:text-info-900 text-info-700 whitespace-nowrap flex items-center justify-center px-3 py-2 w-full sm:w-auto text-center"
            >
              <div className="flex items-center justify-center w-full">
              <Users className="mr-2 w-4 h-4" />
              <span className="text-sm">Student View</span>
              </div>
            </TabsTrigger>
            </TabsList>

        {/* Course Overview Tab */}
        <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-white border-primary-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-semibold text-primary-700">Total Students</CardTitle>
                <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-primary-800">{courseProgress.length}</div>
                <p className="text-primary-600/70 text-xs mt-1">Enrolled in course</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-success-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-semibold text-success-700">Avg Completion</CardTitle>
                <div className="p-1.5 sm:p-2 bg-success-100 rounded-lg">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-success-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-success-800">
                  {courseProgress.length > 0
                    ? Math.round(courseProgress.reduce((acc, s) => acc + s.completion, 0) / courseProgress.length)
                    : 0}%
                </div>
                <p className="text-success-600/70 text-xs mt-1">Course progress</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-info-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-semibold text-info-700">Avg Grade</CardTitle>
                <div className="p-1.5 sm:p-2 bg-info-100 rounded-lg">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-info-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-info-800">
                  {courseProgress.length > 0
                    ? Math.round(courseProgress.reduce((acc, s) => acc + s.averageGrade, 0) / courseProgress.length)
                    : 0}%
                </div>
                <p className="text-info-600/70 text-xs mt-1">Class average</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-danger-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-semibold text-danger-700">At Risk Students</CardTitle>
                <div className="p-1.5 sm:p-2 bg-danger-100 rounded-lg">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-danger-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-danger-800">
                  {courseProgress.filter(s => s.completion < 50).length}
                </div>
                <p className="text-danger-600/70 text-xs mt-1">Need attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Course Completion Chart */}
          <Card className="bg-white border-primary-200 shadow-sm rounded-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-primary-800">Student Course Completion %</CardTitle>
                  <CardDescription className="text-primary-600/70 text-xs sm:text-sm">Individual student progress in the selected course</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={chartConfig} className="h-[300px] sm:h-[350px] w-full">
                <BarChart
                  data={courseProgress}
                  margin={{ top: 20, right: 20, left: 10, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="studentName"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={8}
                    interval={0}
                    stroke="#64748b"
                  />
                  <YAxis
                    domain={[0, 100]}
                    label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }}
                    stroke="#64748b"
                    fontSize={10}
                  />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white/95 backdrop-blur-sm p-3 sm:p-4 border border-primary-200 rounded-lg shadow-lg">
                            <p className="font-bold text-primary-800 text-sm break-words">{label}</p>
                            <p className="text-sm text-primary-600">
                              <span className="font-medium text-success-600">{payload[0].value}%</span> completed
                            </p>
                            <p className="text-sm text-primary-600">
                              Grade: <span className="font-medium text-info-600">{data.averageGrade}%</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="completion"
                    fill="var(--color-chart-1)"
                    radius={[2, 2, 0, 0]}
                    name="Completion %"
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Submission Heatmap */}
          <Card className="bg-white border-primary-200 shadow-sm rounded-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 sm:p-2 bg-success-100 rounded-lg">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-success-600" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-primary-800">Assignment Submission Status</CardTitle>
                  <CardDescription className="text-primary-600/70 text-xs sm:text-sm">Overview of student submissions across assignments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="overflow-x-auto">
                <div className="min-w-[600px] sm:min-w-[1000px] p-3 sm:p-4 bg-gray-50 rounded-lg border">
                  <div className="grid grid-cols-6 gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div className="font-semibold text-xs sm:text-sm text-gray-700">Student</div>
                    {assignmentAnalytics.slice(0, 5).map((assignment, idx) => (
                      <div key={idx} className="font-semibold text-xs text-center p-1 sm:p-2 bg-white rounded border">
                        <div className="break-words leading-tight text-gray-700">{assignment.assignmentTitle}</div>
                      </div>
                    ))}
                  </div>
                  {courseProgress.slice(0, 8).map((student, studentIdx) => {
                    return (
                      <div key={studentIdx} className="grid grid-cols-6 gap-2 sm:gap-4 mb-2 sm:mb-3">
                        <div className="text-xs sm:text-sm font-medium py-2 text-gray-700 truncate">{student.studentName}</div>
                        {assignmentAnalytics.slice(0, 5).map((_, assignmentIdx) => {
                          // Generate deterministic submission status based on student and assignment
                          const seed = studentIdx * 5 + assignmentIdx;
                          const statusRand = (seed * 7) % 100;

                          let score, bgColor, textColor;
                          if (statusRand < 15) { // 15% not submitted
                            score = null;
                            bgColor = 'bg-gray-400';
                            textColor = 'text-white';
                          } else if (statusRand < 25) { // 10% late
                            score = Math.round(70 + (seed % 25));
                            bgColor = 'bg-orange-500';
                            textColor = 'text-white';
                          } else { // 75% on time
                            score = Math.round(75 + (seed % 25));
                            bgColor = 'bg-green-500';
                            textColor = 'text-white';
                          }

                          return (
                            <div
                              key={assignmentIdx}
                              className={`h-8 sm:h-10 rounded-lg text-xs flex items-center justify-center font-semibold ${bgColor} ${textColor}`}
                            >
                              {score !== null ? `${score}%` : '-'}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-4 sm:mt-6 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
                      <span className="text-gray-700">On Time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 rounded"></div>
                      <span className="text-gray-700">Late Submission</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded"></div>
                      <span className="text-gray-700">Not Submitted</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Grade Trend */}
          <Card className="bg-white border-primary-200 shadow-sm rounded-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 sm:p-2 bg-info-100 rounded-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-info-600" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-primary-800">Grade Trends</CardTitle>
                  <CardDescription className="text-primary-600/70 text-xs sm:text-sm">Average grades across assignments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={chartConfig} className="h-[350px] sm:h-[400px] w-full">
                <LineChart data={assignmentAnalytics} margin={{ top: 20, right: 20, left: 10, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="assignmentTitle"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    fontSize={9}
                    stroke="#64748b"
                  />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="averageGrade"
                    stroke="var(--color-grade)"
                    strokeWidth={3}
                    name="Average Grade %"
                    dot={{ fill: 'var(--color-grade)', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: 'var(--color-grade)' }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignment Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
          {assignmentAnalytics.length === 0 ? (
            <Card className="bg-white border-primary-200 shadow-sm rounded-lg">
              <CardContent className="text-center py-12 sm:py-16">
                <div className="p-3 sm:p-4 bg-primary-100 rounded-xl inline-block mb-4">
                  <BookOpen className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-primary-600" />
                </div>
                <h3 className="mt-2 text-base sm:text-lg font-bold text-primary-800">No assignments found</h3>
                <p className="mt-1 text-xs sm:text-sm text-primary-600/70">Create assignments to see analytics.</p>
              </CardContent>
            </Card>
          ) : (
            assignmentAnalytics.map((assignment, index) => (
              <Card key={index} className="bg-white border-primary-200 shadow-sm rounded-lg">
                <CardHeader className="border-b border-primary-100 pb-3 sm:pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 sm:p-2 bg-success-100 rounded-lg">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-success-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-xl font-bold text-primary-800 break-words">{assignment.assignmentTitle}</CardTitle>
                      <CardDescription className="text-primary-600/70 text-xs sm:text-sm">
                        {assignment.submissionCount} submissions • Average: {assignment.averageGrade}%
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Grade Distribution */}
                    <div className="bg-primary-50 p-4 sm:p-6 rounded-lg border border-primary-100">
                      <h4 className="text-base sm:text-lg font-bold text-primary-800 mb-3 sm:mb-4 flex items-center gap-2">
                        <div className="p-1 bg-primary-200 rounded-lg">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary-700" />
                        </div>
                        Grade Distribution
                      </h4>
                      <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px]">
                        <BarChart data={assignment.gradeDistribution}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="range" stroke="#64748b" fontSize={10} />
                          <YAxis stroke="#64748b" fontSize={10} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {assignment.gradeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </div>

                    {/* Submission Timeliness */}
                    <div className="bg-success-50 p-4 sm:p-6 rounded-lg border border-success-100">
                      <h4 className="text-base sm:text-lg font-bold text-primary-800 mb-3 sm:mb-4 flex items-center gap-2">
                        <div className="p-1 bg-success-200 rounded-lg">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 text-success-700" />
                        </div>
                        Submission Timeliness
                      </h4>
                      <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px]">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'On Time', value: assignment.onTimeCount, fill: 'var(--color-onTime)' },
                              { name: 'Late', value: assignment.lateCount, fill: 'var(--color-late)' },
                              { name: 'Not Submitted', value: assignment.notSubmittedCount, fill: 'var(--color-missing)' }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                            stroke="#ffffff"
                            strokeWidth={2}
                            fontSize={11}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Student View Tab */}
        <TabsContent value="student" className="space-y-4 sm:space-y-8 mt-4 sm:mt-8">
          <Card className="bg-white border-primary-200 shadow-sm rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-700" />
                </div>
                <span className="text-sm sm:text-base font-medium text-primary-800">Select Student:</span>
              </div>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="w-full sm:w-72 bg-white border-primary-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-primary-200">
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {students.length === 0 ? (
            <Card className="bg-white border-primary-200 shadow-sm rounded-lg">
              <CardContent className="text-center py-12 sm:py-16">
                <div className="p-3 sm:p-4 bg-primary-100 rounded-xl inline-block mb-4">
                  <Users className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-primary-600" />
                </div>
                <h3 className="mt-2 text-base sm:text-lg font-bold text-primary-800">No students enrolled</h3>
                <p className="mt-1 text-xs sm:text-sm text-primary-600/70">Invite students to see their performance.</p>
              </CardContent>
            </Card>
          ) : studentPerformance && (
            <>
              {/* Student Progress Overview */}
              <Card className="bg-gradient-to-br from-primary-50 to-success-50 border-primary-200 shadow-lg rounded-2xl">
                <CardHeader className="pb-4 border-b border-primary-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-200 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-primary-700" />
                    </div>
                    <CardTitle className="text-xl font-bold text-primary-800">
                      {studentPerformance.studentName} - Progress Overview
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-8 mb-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                        {studentPerformance.courseCompletion}%
                      </div>
                      <div className="text-primary-700 font-semibold mt-1">Course Completion</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-primary-600 mb-2">Progress Indicator</div>
                      <div className="w-full bg-primary-100 rounded-full h-6 overflow-hidden shadow-inner">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-6 rounded-full transition-all duration-500 ease-out shadow-sm"
                          style={{ width: `${studentPerformance.courseCompletion}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assignment Table */}
              <Card className="bg-white/80 backdrop-blur-sm border-primary-200 shadow-lg rounded-2xl">
                <CardHeader className="pb-4 border-b border-primary-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success-100 rounded-xl">
                      <BookOpen className="w-5 h-5 text-success-700" />
                    </div>
                    <CardTitle className="text-xl font-bold text-primary-800">Assignment Breakdown</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-primary-200">
                          <th className="text-left py-4 px-4 font-bold text-primary-800">Assignment</th>
                          <th className="text-left py-4 px-4 font-bold text-primary-800">Grade</th>
                          <th className="text-left py-4 px-4 font-bold text-primary-800">Submission Date</th>
                          <th className="text-left py-4 px-4 font-bold text-primary-800">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentPerformance.assignments.map((assignment, index) => (
                          <tr key={index} className="border-b border-primary-100 hover:bg-primary-50/50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-semibold text-primary-800 break-words max-w-xs">
                                {assignment.title}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {assignment.grade !== null ? (
                                <span className={`font-bold text-xl px-3 py-1 rounded-xl ${
                                  assignment.grade >= 90 ? 'text-success-700 bg-success-100' :
                                  assignment.grade >= 80 ? 'text-info-700 bg-info-100' :
                                  assignment.grade >= 70 ? 'text-warning-700 bg-warning-100' :
                                  'text-danger-700 bg-danger-100'
                                }`}>
                                  {assignment.grade}%
                                </span>
                              ) : (
                                <span className="text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-xl">Not graded</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {assignment.submissionDate ? (
                                <div className="text-primary-700 font-medium">
                                  {new Date(assignment.submissionDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              ) : (
                                <span className="text-gray-500 font-medium">Not submitted</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                                assignment.status === 'submitted' ? 'bg-gradient-to-r from-success-100 to-success-200 text-success-800 border border-success-300' :
                                assignment.status === 'late' ? 'bg-gradient-to-r from-warning-100 to-warning-200 text-warning-800 border border-warning-300' :
                                'bg-gradient-to-r from-danger-100 to-danger-200 text-danger-800 border border-danger-300'
                              }`}>
                                {assignment.status === 'submitted' ? 'On Time' :
                                 assignment.status === 'late' ? 'Late' : 'Missing'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Chart */}
              <Card className="bg-white border-primary-200 shadow-sm rounded-lg">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 sm:p-2 bg-info-100 rounded-lg">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-info-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg font-semibold text-primary-800">Submission Timeline</CardTitle>
                      <CardDescription className="text-primary-600/70 text-xs sm:text-sm">Assignment submission pattern over time</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <ChartContainer config={chartConfig} className="h-[350px] sm:h-[400px] w-full">
                    <LineChart
                      data={studentPerformance.assignments.map((assignment, index) => ({
                        assignment: assignment.title.length > 12 ?
                          assignment.title.substring(0, 12) + '...' : assignment.title,
                        fullTitle: assignment.title,
                        dueDate: new Date(assignment.dueDate).getTime(),
                        submissionDate: assignment.submissionDate ?
                          new Date(assignment.submissionDate).getTime() : null,
                        status: assignment.status,
                        grade: assignment.grade,
                        daysDifference: assignment.submissionDate ?
                          Math.round((new Date(assignment.submissionDate).getTime() - new Date(assignment.dueDate).getTime()) / (1000 * 3600 * 24)) : null,
                        index: index + 1
                      }))}
                      margin={{ top: 20, right: 20, left: 10, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="assignment"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        fontSize={8}
                        interval={0}
                        stroke="#64748b"
                      />
                      <YAxis
                        label={{ value: 'Days from Due Date', angle: -90, position: 'insideLeft' }}
                        domain={[-5, 5]}
                        stroke="#64748b"
                        fontSize={10}
                      />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length > 0) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white/95 backdrop-blur-sm p-3 sm:p-4 border border-primary-200 rounded-lg shadow-lg">
                                <p className="font-bold text-primary-800 text-sm">{data.fullTitle}</p>
                                <p className="text-xs sm:text-sm text-primary-600">Due: {new Date(data.dueDate).toLocaleDateString()}</p>
                                {data.submissionDate && (
                                  <p className="text-xs sm:text-sm text-primary-600">Submitted: {new Date(data.submissionDate).toLocaleDateString()}</p>
                                )}
                                <p className={`text-xs sm:text-sm font-semibold ${
                                  data.status === 'submitted' ? 'text-success-600' :
                                  data.status === 'late' ? 'text-warning-600' : 'text-danger-600'
                                }`}>
                                  Status: {data.status === 'submitted' ? 'On Time' :
                                          data.status === 'late' ? 'Late' : 'Missing'}
                                </p>
                                {data.grade && (
                                  <p className="text-xs sm:text-sm font-medium text-primary-700">Grade: {data.grade}%</p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="daysDifference"
                        stroke="var(--color-chart-2)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--color-chart-2)', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: 'var(--color-chart-2)' }}
                        name="Days from Due Date"
                      />
                      {/* Reference line at y=0 for due date */}
                      <Line
                        type="monotone"
                        dataKey={() => 0}
                        stroke="var(--color-chart-5)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Due Date"
                      />
                    </LineChart>
                  </ChartContainer>
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary-50 rounded-lg border border-primary-100">
                    <div className="text-xs sm:text-sm text-primary-700 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-warning-400 rounded-full"></div>
                        <span>Points above the dashed line indicate late submissions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-success-400 rounded-full"></div>
                        <span>Points below the dashed line indicate early submissions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-info-400 rounded-full"></div>
                        <span>Points on the dashed line indicate submissions on the due date</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
