"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { BookOpen, TrendingUp, Clock, Target, Lightbulb, RefreshCw } from "lucide-react";
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
  status: 'submitted' | 'late' | 'overdue';
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
    color: "hsl(var(--chart-1))",
  },
  completion: {
    label: "Completion %",
    color: "hsl(var(--chart-2))",
  },
  submitted: {
    label: "Submitted",
    color: "hsl(var(--chart-1))",
  },
  missing: {
    label: "Missing",
    color: "hsl(var(--chart-5))",
  },
};

const GRADE_COLORS = ['#10b981', '#f59e0b', '#ef4444']; // green, yellow, red

export default function StudentProgressView({ studentId }: StudentProgressViewProps) {
  const [courses, setCourses] = useState<CourseOverview[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
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
        const response = await fetch('/api/student/courses-overview');
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || []);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch courses');
        }
      } catch (error) {
        console.error('Error fetching courses overview:', error);
        setError('Network error occurred while fetching courses');
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
        const response = await fetch(`/api/student/course-details?courseId=${selectedCourse}`);
        if (response.ok) {
          const data = await response.json();
          setCourseDetails(data.courseDetails);
          setAssignments(data.assignments || []);
          setShowCourseDetails(true);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch course details');
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
        setError('Network error occurred while fetching course details');
      }
    };

    fetchCourseDetails();
  }, [selectedCourse]);  // Generate AI improvement tips
  const generateImprovementTips = useCallback(async () => {
    if (!selectedCourse) return;

    setTipsLoading(true);
    try {
      const response = await fetch('/api/student/improvement-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: selectedCourse })
      });
      
      if (response.ok) {
        const data = await response.json();
        setImprovementTips(data.tips || "");
      } else {
        const errorData = await response.json();
        console.error('Failed to generate tips:', errorData.error);
        setImprovementTips("Unable to generate improvement tips at this time. Please try again later.");
      }
    } catch (error) {
      console.error('Error generating improvement tips:', error);
      setImprovementTips("Network error occurred while generating tips. Please check your connection and try again.");
    } finally {
      setTipsLoading(false);
    }
  }, [selectedCourse]);

  // Auto-generate tips when course details are loaded
  useEffect(() => {
    if (showCourseDetails && selectedCourse && !improvementTips) {
      generateImprovementTips();
    }
  }, [showCourseDetails, selectedCourse, improvementTips, generateImprovementTips]);

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

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-red-400">⚠️</div>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Error Loading Data</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <div className="mt-4">
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </button>
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
          You are not enrolled in any courses yet. Contact your instructor or administrator to get enrolled in courses.
        </p>
        <div className="mt-4">
          <p className="text-xs text-gray-400">
            Once you&apos;re enrolled, you&apos;ll see your course progress, grades, and personalized study tips here.
          </p>
        </div>
      </div>
    );
  }

  if (!showCourseDetails) {
    // Course Overview Dashboard
    const overallStats = {
      totalCourses: courses.length,
      averageCompletion: Math.round(courses.reduce((acc, c) => acc + c.completionPercentage, 0) / courses.length),
      averageGrade: Math.round(courses.reduce((acc, c) => acc + c.averageGrade, 0) / courses.length),
      totalAssignments: courses.reduce((acc, c) => acc + c.totalAssignments, 0),
      submittedAssignments: courses.reduce((acc, c) => acc + c.submittedAssignments, 0)
    };

    const gradeDistribution = courses.map(course => ({
      name: course.courseCode,
      grade: course.averageGrade,
      completion: course.completionPercentage,
      fill: course.averageGrade >= 80 ? GRADE_COLORS[0] :
            course.averageGrade >= 60 ? GRADE_COLORS[1] : GRADE_COLORS[2]
    }));

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Progress Dashboard</h2>
            <p className="text-gray-600">Overview of your academic performance</p>
          </div>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="View course details" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.courseId} value={course.courseId}>
                  {course.courseName} ({course.courseCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalCourses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.averageCompletion}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Grade</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.averageGrade}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallStats.submittedAssignments}/{overallStats.totalAssignments}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Course Performance Overview</CardTitle>
            <CardDescription>Your average grades across all enrolled courses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="grade" fill="var(--color-grade)" name="Average Grade %" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course.courseId}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedCourse(course.courseId)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{course.courseName}</CardTitle>
                <CardDescription>{course.courseCode}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Grade</span>
                  <span className={`font-bold ${
                    course.averageGrade >= 80 ? 'text-green-600' :
                    course.averageGrade >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {course.averageGrade}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion</span>
                  <span className="font-bold">{course.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.completionPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{course.submittedAssignments}/{course.totalAssignments} assignments</span>
                  <span>{course.gradedAssignments} graded</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Course-Specific Details View
  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowCourseDetails(false);
              setSelectedCourse("");
              setImprovementTips("");
            }}
          >
            ← Back to Overview
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{courseDetails?.courseName}</h2>
            <p className="text-gray-600">{courseDetails?.courseCode}</p>
          </div>
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Switch course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.courseId} value={course.courseId}>
                {course.courseName} ({course.courseCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course Stats */}
      {courseDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseDetails.completionPercentage}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseDetails.averageGrade}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courseDetails.submittedAssignments}/{courseDetails.totalAssignments}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Graded</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courseDetails.gradedAssignments}/{courseDetails.totalAssignments}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assignment Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Breakdown</CardTitle>
          <CardDescription>Detailed view of your performance on each assignment</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No assignments yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your instructor hasn&apos;t created any assignments for this course yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Assignment</th>
                  <th className="text-left p-3">Topics</th>
                  <th className="text-left p-3">Grade</th>
                  <th className="text-left p-3">Due Date</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{assignment.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {assignment.description}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {assignment.topics.slice(0, 2).map((topic, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {topic}
                          </span>
                        ))}
                        {assignment.topics.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            +{assignment.topics.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {assignment.grade !== null ? (
                        <span className={`font-medium ${
                          assignment.grade >= 80 ? 'text-green-600' :
                          assignment.grade >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {assignment.grade}/{assignment.totalPoints}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not graded</span>
                      )}
                    </td>
                    <td className="p-3">
                      {assignment.dueDate ? (
                        new Date(assignment.dueDate).toLocaleDateString()
                      ) : (
                        <span className="text-gray-400">No due date</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        assignment.status === 'submitted' ? 'bg-green-100 text-green-800' :
                        assignment.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {assignment.status === 'submitted' ? 'Submitted' :
                         assignment.status === 'late' ? 'Submitted Late' : 'Overdue'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Improvement Tips */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <CardTitle>AI-Powered Improvement Tips</CardTitle>
            </div>
            <Button
              onClick={generateImprovementTips}
              disabled={tipsLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${tipsLoading ? 'animate-spin' : ''}`} />
              {tipsLoading ? 'Generating...' : 'Refresh Tips'}
            </Button>
          </div>
          <CardDescription>
            Personalized recommendations based on your performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tipsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
              <span className="text-gray-600">AI is analyzing your performance...</span>
            </div>
          ) : improvementTips ? (
            <div className="prose prose-sm max-w-none">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <MyMarkdown>{improvementTips}</MyMarkdown>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Click &ldquo;Refresh Tips&rdquo; to get personalized improvement recommendations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
