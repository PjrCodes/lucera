import React from "react";
import { Session } from "next-auth";

interface Alert {
  id: number;
  message: string;
  date: string;
}

interface Props {
  session: Session | null;
  isTeacher: boolean;
}

const StudentAlerts: React.FC<Props> = ({ session, isTeacher }) => {
  // Dummy data for alerts - replace with actual data fetching later
  const dummyAlerts: Alert[] = [
    {
      id: 1,
      message: "New assignment posted in CS101",
      date: "2024-01-10"
    },
    {
      id: 2,
      message: "Grade updated for CS201 midterm",
      date: "2024-01-09"
    },
    {
      id: 3,
      message: "Class schedule changed for tomorrow",
      date: "2024-01-08"
    }
  ];

  const alerts = dummyAlerts;

  return (
    <div className="bg-yellow-50 rounded shadow p-4 min-h-[220px]">
      <h2 className="font-bold mb-2 text-yellow-900">Student Alerts</h2>
      <ul>
        {alerts.map((alert) => (
          <li key={alert.id} className="mb-1">
            <span>{alert.message}</span>{" "}
            <span className="text-gray-400 text-xs">({alert.date})</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentAlerts;
