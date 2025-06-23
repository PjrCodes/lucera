"use client";
import CourseDescription from "@/components/feature/course/cards/course-description";
import CourseUnits from "@/components/feature/course/cards/course-units";
import CourseTimeline from "@/components/feature/course/cards/course-timeline";
import CourseAssignmentsCard from "@/components/feature/course/cards/course-assignments-card";
import CourseGradesCard from "@/components/feature/course/cards/course-grades-card";
import CourseMaterialsCard from "@/components/feature/course/cards/course-materials-card";
import CoursePollsCard from "@/components/feature/course/cards/course-polls-card";
import CourseStudentsCard from "@/components/feature/course/cards/course-students-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, ChartNoAxesColumn, ClipboardList, Clock, FileText, List, MessagesSquare, Users } from "lucide-react";
import { CourseContentData, Course } from "@/lib/schemas";

interface Assignment {
  id: number;
  name: string;
  due: string;
  status: string;
  grade: string | null;
}

interface PollOrAnnouncement {
  id: number;
  type: string;
  question: string;
  responses: number | null;
  active: boolean;
}

interface Grade {
  id: number;
  title: string;
  score: string;
  date: string;
}

interface Student {
  id: number;
  name: string;
  email?: string;
}

export default function CourseTabs({
  course,
  assignments,
  courseMaterialsData,
  pollsAndAnnouncements,
  students,
  grades,
}: {
  course: Course;
  assignments: Assignment[];
  courseMaterialsData: CourseContentData;
  pollsAndAnnouncements: PollOrAnnouncement[];
  students: Student[];
  grades: Grade[];
}) {

  
  return (
    <div className="w-full flex flex-col items-center">
      <Tabs defaultValue="description" className="w-full">
        {/* Responsive scrollable tab bar */}
        <div className="relative rounded-lg overflow-x-auto h-12 bg-primary-100 border border-primary-200 w-full min-w-0 max-w-full sm:min-w-[22rem] md:min-w-[36rem] lg:min-w-[48rem] xl:min-w-[64rem] sm:max-w-5xl mx-auto">
          <TabsList className="absolute flex flex-row justify-stretch w-max min-w-full bg-transparent">
            <TabsTrigger
              value="description"
              className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-900 text-primary-700 whitespace-nowrap flex items-center px-3 py-2"
            >
              <BookOpen className="mr-1" />
              Description
            </TabsTrigger>
            <TabsTrigger
              value="units"
              className="data-[state=active]:bg-secondary-50 data-[state=active]:text-secondary-900 text-secondary-700 whitespace-nowrap flex items-center px-3 py-2"
            >
              <List className="mr-1" />
              Units
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-info-50 data-[state=active]:text-info-900 text-info-700 whitespace-nowrap flex items-center px-3 py-2"
            >
              <Clock className="mr-1" />
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="data-[state=active]:bg-success-50 data-[state=active]:text-success-900 text-success-700 whitespace-nowrap flex items-center px-3 py-2"
            >
              <ClipboardList className="mr-1" />
              Assignments
            </TabsTrigger>
            <TabsTrigger
              value="grades"
              className="data-[state=active]:bg-accent-50 data-[state=active]:text-accent-900 text-accent-700 whitespace-nowrap flex items-center px-3 py-2"
            >
            <ChartNoAxesColumn className="mr-1" />
              Grades
            </TabsTrigger>
            <TabsTrigger
              value="materials"
              className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-900 text-primary-700 whitespace-nowrap flex items-center px-3 py-2"
            >
              <FileText className="mr-1" />
              Materials
            </TabsTrigger>
            <TabsTrigger
              value="polls"
              className="data-[state=active]:bg-accent-50 data-[state=active]:text-accent-900 text-accent-700 whitespace-nowrap flex items-center px-3 py-2"
            >

              <MessagesSquare className="mr-1" />
              Polls & Announcements
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="data-[state=active]:bg-secondary-50 data-[state=active]:text-secondary-900 text-secondary-700 whitespace-nowrap flex items-center px-3 py-2"
            >
              <Users className="mr-1" />
              Students
            </TabsTrigger>
          </TabsList>
        </div>
        {/* Content area with only min-h to prevent jumping, no extra box styling */}
        <div className="w-full min-w-0 max-w-full sm:min-w-[22rem] md:min-w-[36rem] lg:min-w-[48rem] xl:min-w-[64rem] sm:max-w-5xl mx-auto px-2 sm:px-0 mt-2 min-h-[340px] flex flex-col justify-start">
          <TabsContent value="description">
            <CourseDescription course={course} />
          </TabsContent>
          <TabsContent value="units">
            <CourseUnits course={course} />
          </TabsContent>
          <TabsContent value="timeline">
            <CourseTimeline course={course} />
          </TabsContent>
          <TabsContent value="assignments">
            <CourseAssignmentsCard assignments={assignments} />
          </TabsContent>
          <TabsContent value="grades">
            <CourseGradesCard grades={grades} />
          </TabsContent>
          <TabsContent value="materials">
            <CourseMaterialsCard courseMaterialsData={courseMaterialsData} />
          </TabsContent>
          <TabsContent value="polls">
            <CoursePollsCard pollsAndAnnouncements={pollsAndAnnouncements} />
          </TabsContent>
          <TabsContent value="students">
            <CourseStudentsCard students={students} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
