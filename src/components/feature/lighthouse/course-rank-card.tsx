import React from "react";
import { BookOpen } from "lucide-react";

interface CourseRank {
  courseCode: string;
  courseName: string;
  rank: number;
  points: number;
  totalStudents: number;
}

interface CourseRankCardProps {
  courseRanks: CourseRank[];
}

const CourseRankCard: React.FC<CourseRankCardProps> = ({ courseRanks }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-bold text-secondary-800 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-secondary-600" />
        Course Rankings
      </h2>
      <div className="space-y-3">
        {courseRanks.map((course, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-secondary-100 rounded-lg"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-secondary-800 text-sm">
                {course.courseCode}
              </h3>
              <p className="text-xs text-secondary-600">{course.courseName}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-secondary-800">#{course.rank}</p>
              <p className="text-xs text-secondary-600">
                of {course.totalStudents}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseRankCard;
