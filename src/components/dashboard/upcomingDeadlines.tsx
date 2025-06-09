import React from "react";
import { Session } from "next-auth";

interface Deadline {
  id: number;
  title: string;
  dueDate: string;
  course: string;
}

interface Props {
  session: Session | null;
  isTeacher: boolean;
}

const UpcomingDeadlines: React.FC<Props> = ({ session, isTeacher }) => {
  // Dummy data for deadlines - replace with actual data fetching later
  const dummyDeadlines: Deadline[] = [
    {
      id: 1,
      title: "Assignment 1",
      dueDate: "2024-01-15",
      course: "CS101"
    },
    {
      id: 2,
      title: "Midterm Exam",
      dueDate: "2024-01-22",
      course: "CS201"
    },
    {
      id: 3,
      title: "Project Proposal",
      dueDate: "2024-01-28",
      course: "CS301"
    }
  ];

  const deadlines = dummyDeadlines;

  return (
    <div className="bg-blue-50 rounded shadow p-4 min-h-[220px]">
      <h2 className="font-bold mb-2 text-blue-900">Upcoming Deadlines</h2>
      <ul>
        {deadlines.map((dl) => (
          <li key={dl.id} className="mb-1">
            <span className="font-semibold">{dl.title}</span> ({dl.course}) -{" "}
            <span className="text-red-500">{dl.dueDate}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UpcomingDeadlines;
