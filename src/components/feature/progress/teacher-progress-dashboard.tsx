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
  Line
} from "recharts";
import { Download, Users, BookOpen, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Course, UserWithData } from "@/lib/schemas/database";

interface TeacherProgressDashboardProps {
  userId: string;
}

interface CourseProgress {
  studentName: string;
  completion: number;
  submissions: number;
  averageGrade: number;
}

interface AssignmentAnalytics {
  assignmentTitle: string;
  averageGrade: number;
  submissionCount: number;
  onTimeCount: number;
  lateCount: number;
  notSubmittedCount: number;
  gradeDistribution: { range: string; count: number }[];
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
    color: "hsl(var(--chart-1))",
  },
  submissions: {
    label: "Submissions",
    color: "hsl(var(--chart-2))",
  },
  grade: {
    label: "Grade",
    color: "hsl(var(--chart-3))",
  },
  onTime: {
    label: "On Time",
    color: "hsl(var(--chart-1))",
  },
  late: {
    label: "Late",
    color: "hsl(var(--chart-4))",
  },
  missing: {
    label: "Missing",
    color: "hsl(var(--chart-5))",
  },
};

export default function TeacherProgressDashboard({ userId }: TeacherProgressDashboardProps) {
  const [courses, setCourses] = useState<Course[]>([]);
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
        const response = await fetch('/api/courses/teacher');
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || []);
          if (data.courses && data.courses.length > 0) {
            setSelectedCourse(data.courses[0]._id.toString());
          }
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
        const response = await fetch(`/api/analytics/course-progress-new?courseId=${selectedCourse}`);
        if (response.ok) {
          const data = await response.json();
          setCourseProgress(data.progress || []);
        }
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
        const response = await fetch(`/api/analytics/assignments?courseId=${selectedCourse}`);
        if (response.ok) {
          const data = await response.json();
          setAssignmentAnalytics(data.analytics || []);
        }
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
        const response = await fetch(`/api/courses/${selectedCourse}/students`);
        if (response.ok) {
          const data = await response.json();
          const studentList = data.students?.map((s: UserWithData) => ({
            id: s.id,
            name: s.name
          })) || [];
          setStudents(studentList);
          if (studentList.length > 0) {
            setSelectedStudent(studentList[0].id);
          }
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
        const response = await fetch(`/api/analytics/student-performance?studentId=${selectedStudent}&courseId=${selectedCourse}`);
        if (response.ok) {
          const data = await response.json();
          setStudentPerformance(data.performance || null);
        }
      } catch (error) {
        console.error('Error fetching student performance:', error);
      }
    };

    fetchStudentPerformance();
  }, [selectedStudent, selectedCourse]);

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
        <p className="mt-1 text-sm text-gray-500">
          You haven&apos;t created any courses yet. Create your first course to start tracking student performance!
        </p>
        <div className="mt-4">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Create Your First Course
          </button>
        </div>
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
                  {course.name} ({course.courseCode})
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
          <Card>
            <CardHeader>
              <CardTitle>Student Course Completion %</CardTitle>
              <CardDescription>Individual student progress in the selected course</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={courseProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="studentName"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="completion"
                    fill="var(--color-completion)"
                    name="Completion %"
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Submission Heatmap Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Submission Status</CardTitle>
              <CardDescription>Overview of student submissions across assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[600px] p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-6 gap-2 mb-4">
                    <div className="font-semibold text-sm">Student</div>
                    {assignmentAnalytics.slice(0, 5).map((assignment, idx) => (
                      <div key={idx} className="font-semibold text-xs text-center">
                        {assignment.assignmentTitle.substring(0, 10)}...
                      </div>
                    ))}
                  </div>
                  {courseProgress.slice(0, 8).map((student, studentIdx) => (
                    <div key={studentIdx} className="grid grid-cols-6 gap-2 mb-2">
                      <div className="text-sm truncate">{student.studentName}</div>
                      {Array.from({ length: 5 }).map((_, assignmentIdx) => (
                        <div
                          key={assignmentIdx}
                          className={`h-6 rounded text-xs flex items-center justify-center text-white ${
                            Math.random() > 0.3 ?
                              (Math.random() > 0.2 ? 'bg-green-500' : 'bg-yellow-500') :
                              'bg-red-500'
                          }`}
                        >
                          {Math.random() > 0.3 ? (Math.random() > 0.2 ? '✓' : '⏰') : '✗'}
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="flex justify-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Submitted</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span>Late</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span>Missing</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Grade Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Grade Trends</CardTitle>
              <CardDescription>Average grades across assignments</CardDescription>
            </CardHeader>
            <CardContent>
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
                          <Bar dataKey="count" fill="var(--color-grade)" />
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
              <Card>
                <CardHeader>
                  <CardTitle>{studentPerformance.studentName} - Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-3xl font-bold text-primary-600">
                      {studentPerformance.courseCompletion}%
                    </div>
                    <div className="text-gray-600">Course Completion</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${studentPerformance.courseCompletion}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              {/* Assignment Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Assignment</th>
                          <th className="text-left p-3">Grade</th>
                          <th className="text-left p-3">Submission Date</th>
                          <th className="text-left p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentPerformance.assignments.map((assignment, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3">{assignment.title}</td>
                            <td className="p-3">
                              {assignment.grade !== null ? (
                                <span className={`font-medium ${
                                  assignment.grade >= 90 ? 'text-green-600' :
                                  assignment.grade >= 80 ? 'text-blue-600' :
                                  assignment.grade >= 70 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {assignment.grade}%
                                </span>
                              ) : (
                                <span className="text-gray-400">Not graded</span>
                              )}
                            </td>
                            <td className="p-3">
                              {assignment.submissionDate ? (
                                new Date(assignment.submissionDate).toLocaleDateString()
                              ) : (
                                <span className="text-gray-400">Not submitted</span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                assignment.status === 'submitted' ? 'bg-green-100 text-green-800' :
                                assignment.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
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

              {/* Timeline Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Submission Timeline</CardTitle>
                  <CardDescription>Assignment submission pattern over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <TrendingUp className="mx-auto h-8 w-8 mb-2" />
                      <p className="text-sm">Timeline visualization</p>
                      <p className="text-xs">Shows submission dates vs due dates</p>
                    </div>
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
