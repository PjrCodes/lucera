import React from "react";

interface Deadline {
  id: number;
  title: string;
  dueDate: string;
  course: string;
}

interface Props {
  deadlines: Deadline[];
}

const UpcomingDeadlines: React.FC<Props> = ({ deadlines }) => (
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

export default UpcomingDeadlines;
