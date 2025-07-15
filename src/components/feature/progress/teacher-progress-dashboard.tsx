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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No courses found</h3>
        <p className="mt-1 text-sm text-gray-500">Create your first course to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with global course selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Analytics</h2>
          <p className="text-gray-600">Track student performance and course progress</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course._id.toString()} value={course._id.toString()}>
                  {course.name} ({course.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={exportToCSV}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Course Overview</TabsTrigger>
          <TabsTrigger value="analytics">Assignment Analytics</TabsTrigger>
          <TabsTrigger value="student">Student View</TabsTrigger>
        </TabsList>

        {/* Course Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courseProgress.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {courseProgress.length > 0
                    ? Math.round(courseProgress.reduce((acc, s) => acc + s.completion, 0) / courseProgress.length)
                    : 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Grade</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {courseProgress.length > 0
                    ? Math.round(courseProgress.reduce((acc, s) => acc + s.averageGrade, 0) / courseProgress.length)
                    : 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">At Risk Students</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {courseProgress.filter(s => s.completion < 50).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Completion Chart */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Student Course Completion %</CardTitle>
              <CardDescription>Individual student progress in the selected course</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={courseProgress} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="studentName"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                    interval={0}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="completion"
                    name="Completion %"
                    fill="var(--color-chart-1)"
                  >
                    {courseProgress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill || "var(--color-chart-1)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Submission Heatmap */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Assignment Submission Status</CardTitle>
              <CardDescription>Overview of student submissions across assignments</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="overflow-x-auto">
                <div className="min-w-[1000px] p-6 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-6 gap-4 mb-6">
                    <div className="font-semibold text-sm">Student</div>
                    {assignmentAnalytics.slice(0, 5).map((assignment, idx) => (
                      <div key={idx} className="font-semibold text-xs text-center p-3">
                        <div className="break-words leading-tight">{assignment.assignmentTitle}</div>
                      </div>
                    ))}
                  </div>
                  {courseProgress.slice(0, 8).map((student, studentIdx) => {
                    return (
                      <div key={studentIdx} className="grid grid-cols-6 gap-4 mb-3">
                        <div className="text-sm font-medium py-2">{student.studentName}</div>
                        {assignmentAnalytics.slice(0, 5).map((_, assignmentIdx) => {
                          // Generate deterministic submission status based on student and assignment
                          const seed = studentIdx * 5 + assignmentIdx;
                          const statusRand = (seed * 7) % 100;

                          let score, bgColor;
                          if (statusRand < 15) { // 15% not submitted
                            score = null;
                            bgColor = 'bg-gray-400';
                          } else if (statusRand < 25) { // 10% late
                            score = Math.round(70 + (seed % 25));
                            bgColor = 'bg-orange-500';
                          } else { // 75% on time
                            score = Math.round(75 + (seed % 25));
                            bgColor = 'bg-green-600';
                          }

                          return (
                            <div
                              key={assignmentIdx}
                              className={`h-10 rounded-md text-xs flex items-center justify-center text-white font-semibold ${bgColor}`}
                            >
                              {score !== null ? `${score}%` : '-'}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                  <div className="flex justify-center gap-6 mt-6 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-600 rounded"></div>
                      <span>On Time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span>Late Submission</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-400 rounded"></div>
                      <span>Not Submitted</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Grade Trend */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Grade Trends</CardTitle>
              <CardDescription>Average grades across assignments</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={chartConfig} className="h-[300px]">
                <LineChart data={assignmentAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="assignmentTitle"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="averageGrade"
                    stroke="var(--color-grade)"
                    strokeWidth={2}
                    name="Average Grade %"
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignment Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {assignmentAnalytics.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No assignments found</h3>
                <p className="mt-1 text-sm text-gray-500">Create assignments to see analytics.</p>
              </CardContent>
            </Card>
          ) : (
            assignmentAnalytics.map((assignment, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{assignment.assignmentTitle}</CardTitle>
                  <CardDescription>
                    {assignment.submissionCount} submissions • Average: {assignment.averageGrade}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Grade Distribution */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Grade Distribution</h4>
                      <ChartContainer config={chartConfig} className="h-[200px]">
                        <BarChart data={assignment.gradeDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count">
                            {assignment.gradeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ChartContainer>
                    </div>

                    {/* Submission Timeliness */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Submission Timeliness</h4>
                      <ChartContainer config={chartConfig} className="h-[200px]">
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
        <TabsContent value="student" className="space-y-6">
          <div className="flex items-center gap-4">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {students.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No students enrolled</h3>
                <p className="mt-1 text-sm text-gray-500">Invite students to see their performance.</p>
              </CardContent>
            </Card>
          ) : studentPerformance && (
            <>
              {/* Student Progress Overview */}
              <Card className="mb-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{studentPerformance.studentName} - Progress Overview</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="text-4xl font-bold text-primary-600">
                      {studentPerformance.courseCompletion}%
                    </div>
                    <div className="text-gray-600 font-medium">Course Completion</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-primary-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${studentPerformance.courseCompletion}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              {/* Assignment Table */}
              <Card className="mb-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Assignment Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Assignment</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Grade</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Submission Date</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentPerformance.assignments.map((assignment, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900 break-words max-w-xs">
                                {assignment.title}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {assignment.grade !== null ? (
                                <span className={`font-semibold text-lg ${
                                  assignment.grade >= 90 ? 'text-green-600' :
                                  assignment.grade >= 80 ? 'text-blue-600' :
                                  assignment.grade >= 70 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {assignment.grade}%
                                </span>
                              ) : (
                                <span className="text-gray-400 font-medium">Not graded</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {assignment.submissionDate ? (
                                <div className="text-gray-700">
                                  {new Date(assignment.submissionDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              ) : (
                                <span className="text-gray-400 font-medium">Not submitted</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                assignment.status === 'submitted' ? 'bg-green-100 text-green-800' :
                                assignment.status === 'late' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
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
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Submission Timeline</CardTitle>
                  <CardDescription>Assignment submission pattern over time</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <LineChart
                      data={studentPerformance.assignments.map((assignment, index) => ({
                        assignment: assignment.title.length > 15 ?
                          assignment.title.substring(0, 15) + '...' : assignment.title,
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
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="assignment"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={10}
                        interval={0}
                      />
                      <YAxis
                        label={{ value: 'Days from Due Date', angle: -90, position: 'insideLeft' }}
                        domain={[-5, 5]}
                      />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length > 0) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded shadow-lg">
                                <p className="font-semibold">{data.fullTitle}</p>
                                <p className="text-sm">Due: {new Date(data.dueDate).toLocaleDateString()}</p>
                                {data.submissionDate && (
                                  <p className="text-sm">Submitted: {new Date(data.submissionDate).toLocaleDateString()}</p>
                                )}
                                <p className={`text-sm font-medium ${
                                  data.status === 'submitted' ? 'text-green-600' :
                                  data.status === 'late' ? 'text-orange-600' : 'text-red-600'
                                }`}>
                                  Status: {data.status === 'submitted' ? 'On Time' :
                                          data.status === 'late' ? 'Late' : 'Missing'}
                                </p>
                                {data.grade && (
                                  <p className="text-sm">Grade: {data.grade}%</p>
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
                        strokeWidth={3}
                        dot={{ fill: 'var(--color-chart-2)', strokeWidth: 2, r: 6 }}
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
                  <div className="mt-4 text-xs text-gray-600 space-y-1">
                    <p>• Points above the dashed line indicate late submissions</p>
                    <p>• Points below the dashed line indicate early submissions</p>
                    <p>• Points on the dashed line indicate submissions on the due date</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
