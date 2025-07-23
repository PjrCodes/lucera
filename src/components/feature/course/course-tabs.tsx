"use client";
import { useState } from "react";
import CourseDescription from "@/components/feature/course/cards/course-description";
import CourseUnits from "@/components/feature/course/cards/course-units";
import CourseTimeline from "@/components/feature/course/cards/course-timeline";
import CourseAssignmentsCard from "@/components/feature/course/cards/course-assignments-card";
import CourseGradesCard from "@/components/feature/course/cards/course-grades-card";
import CourseMaterialsCard from "@/components/feature/course/cards/course-materials-card";
import CourseStudentsCard from "@/components/feature/course/cards/course-students-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BookOpen,
  ClipboardList,
  Clock,
  FileText,
  List,
  Users,
} from "lucide-react";
import {
  AssignmentWithEmbeddedFile,
  ContentWithEmbeddedFile,
  Course,
  UserWithData,
} from "@/lib/schemas/database";

interface CourseTabsProps {
  course: Course;
  assignments: AssignmentWithEmbeddedFile[];
  courseMaterialsData: ContentWithEmbeddedFile[];
  students: UserWithData[];
  courseId: string;
  isTeacher: boolean;
  availableStudents: { id: string; name: string; email: string }[];
}

export default function CourseTabs({
  course,
  assignments,
  courseMaterialsData,
  students,
  courseId,
  isTeacher,
  availableStudents,
}: CourseTabsProps) {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="w-full flex flex-col items-center">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Responsive scrollable tab bar */}
        <div className="w-full">
          <TabsList className="flex flex-row flex-wrap gap-1 w-full min-w-full bg-primary-100 border border-primary-200 rounded-lg p-1 min-h-fit">
            <TabsTrigger
              value="description"
              className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-900 text-primary-700 whitespace-nowrap flex items-center px-3 py-2"
            >
              <BookOpen className="mr-1" />
              Description
            </TabsTrigger>
            <TabsTrigger
              value="units"
              className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-900 text-primary-700 whitespace-nowrap flex items-center px-3 py-2"
            >
              <List className="mr-1" />
              Units
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-900 text-primary-700 whitespace-nowrap flex items-center px-3 py-2"
            >
              <Clock className="mr-1" />
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-900 text-primary-700 whitespace-nowrap flex items-center px-3 py-2"
            >
              <ClipboardList className="mr-1" />
              Assignments
            </TabsTrigger>
            {/* <TabsTrigger
              value="grades"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-900 text-blue-700 whitespace-nowrap flex items-center px-3 py-2"
            >
              <ChartNoAxesColumn className="mr-1" />
              Grades
            </TabsTrigger> */}
            <TabsTrigger
              value="materials"
              className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-900 text-primary-700 whitespace-nowrap flex items-center px-3 py-2"
            >
              <FileText className="mr-1" />
              Materials
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="data-[state=active]:bg-primary-50 data-[state=active]:text-primary-900 text-primary-700 whitespace-nowrap flex items-center px-3 py-2"
            >
              <Users className="mr-1" />
              Students
            </TabsTrigger>{" "}
          </TabsList>
        </div>
        {/* Content area with dashboard-style spacing and layout */}
        <div className="w-full mt-4 min-h-[340px] flex flex-col justify-start">
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
            <CourseAssignmentsCard
              assignments={assignments}
              courseId={courseId}
              isTeacher={isTeacher}
            />
          </TabsContent>
          <TabsContent value="grades">
            <CourseGradesCard
              courseId={courseId}
              userRole={isTeacher ? "teacher" : "student"}
            />
          </TabsContent>
          <TabsContent value="materials">
            <CourseMaterialsCard
              courseMaterialsData={courseMaterialsData}
              isTeacher={isTeacher}
              courseId={courseId}
            />
          </TabsContent>
          {/* Students Tab */}
          <TabsContent value="students">
            <CourseStudentsCard
              students={students}
              courseId={courseId}
              isTeacher={isTeacher}
              availableStudents={availableStudents}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
